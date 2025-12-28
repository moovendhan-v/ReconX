import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { spawn } from 'child_process';
import { ScansService } from './scans.service';
import { ScanEventsService, ScanEventType } from './scan-events.service';
import { SubdomainResult, PortResult, PortState } from '../../db/schema';
import { join } from 'path';

@Injectable()
export class ScanOrchestratorService implements OnModuleInit {
    private readonly logger = new Logger(ScanOrchestratorService.name);
    private readonly pythonPath: string;
    private readonly scannersPath: string;

    constructor(
        private readonly scansService: ScansService,
        private readonly scanEventsService: ScanEventsService,
    ) {
        // Python paths in Docker container
        this.pythonPath = 'python3';
        this.scannersPath = join(process.cwd(), 'python-core', 'scanners');
    }

    onModuleInit() {
        // Subscribe to scan created events
        this.scanEventsService.onEvent((event) => {
            if (event.type === ScanEventType.CREATED) {
                this.logger.log(`New scan created: ${event.scanId}, starting execution`);
                this.executeScan(event.scanId, event.data.target);
            }
        });

        this.logger.log('✓ Scan Orchestrator initialized');
    }

    /**
     * Execute a complete scan (subdomain + ports)
     */
    private async executeScan(scanId: string, target: string) {
        try {
            // Update scan to RUNNING
            await this.scansService.update(scanId, { status: 'RUNNING' as any });
            await this.scansService.updateProgress(scanId, 0);
            await this.scanEventsService.scanStarted(scanId);

            // Phase 1: Subdomain Enumeration
            this.logger.log(`[${scanId}] Starting subdomain enumeration for ${target}`);
            const subdomains = await this.runSubdomainEnum(scanId, target);

            if (subdomains.length === 0) {
                this.logger.warn(`[${scanId}] No subdomains found, using root domain only`);
                subdomains.push({ subdomain: target, ip: [], discovered_at: new Date().toISOString() });
            }

            // Update progress - subdomain enum complete (50%)
            await this.scansService.updateProgress(scanId, 50);

            // Phase 2: Port Scanning
            this.logger.log(`[${scanId}] Starting port scanning for ${subdomains.length} subdomains`);
            await this.runPortScans(scanId, subdomains);

            // Complete the scan
            await this.scansService.completeScan(scanId);
            this.logger.log(`[${scanId}] Scan completed successfully`);

        } catch (error) {
            this.logger.error(`[${scanId}] Scan failed: ${error.message}`);
            await this.scansService.failScan(scanId, error.message);
        }
    }

    /**
     * Run subdomain enumeration scanner
     */
    private async runSubdomainEnum(scanId: string, target: string): Promise<SubdomainResult[]> {
        return new Promise((resolve, reject) => {
            const subdomains: SubdomainResult[] = [];
            const scriptPath = join(this.scannersPath, 'subdomain_enum.py');

            const process = spawn(this.pythonPath, [scriptPath, target]);

            process.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;

                    try {
                        const event = JSON.parse(line);

                        if (event.type === 'subdomain') {
                            const subdomain: SubdomainResult = {
                                subdomain: event.subdomain,
                                ip: event.ip,
                                discovered_at: event.discovered_at,
                            };
                            subdomains.push(subdomain);

                            // Save to database and publish event
                            this.scansService.addSubdomainResult(scanId, subdomain);
                            this.logger.debug(`[${scanId}] Found subdomain: ${event.subdomain}`);
                        } else if (event.type === 'progress') {
                            // Update progress for subdomain phase (0-50%)
                            const overallProgress = Math.floor(event.percent * 0.5);
                            this.scansService.updateProgress(scanId, overallProgress);
                        }
                    } catch (error) {
                        this.logger.warn(`Failed to parse scanner output: ${line}`);
                    }
                }
            });

            process.stderr.on('data', (data) => {
                this.logger.error(`Subdomain scanner error: ${data.toString()}`);
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(subdomains);
                } else {
                    reject(new Error(`Subdomain scanner exited with code ${code}`));
                }
            });

            process.on('error', (error) => {
                reject(new Error(`Failed to start subdomain scanner: ${error.message}`));
            });
        });
    }

    /**
     * Run port scans for discovered subdomains
     */
    private async runPortScans(scanId: string, subdomains: SubdomainResult[]): Promise<void> {
        const totalSubdomains = subdomains.length;
        let completed = 0;

        // Scan only the first 3 subdomains to avoid long scan times in demo
        const subdomainsToScan = subdomains.slice(0, 3);

        for (const subdomain of subdomainsToScan) {
            await this.scanEventsService.portsScanning(scanId, subdomain.subdomain);
            await this.runPortScan(scanId, subdomain.subdomain);

            completed++;
            // Update progress for port scan phase (50-100%)
            const overallProgress = Math.floor(50 + (completed / totalSubdomains) * 50);
            await this.scansService.updateProgress(scanId, overallProgress);
        }
    }

    /**
     * Run port scan for a single subdomain
     */
    private async runPortScan(scanId: string, target: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const scriptPath = join(this.scannersPath, 'port_scanner.py');
            const process = spawn(this.pythonPath, [scriptPath, target]);

            process.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (!line.trim()) continue;

                    try {
                        const event = JSON.parse(line);

                        if (event.type === 'port') {
                            const port: PortResult = {
                                subdomain: event.subdomain,
                                port: event.port,
                                service: event.service,
                                state: event.state as PortState,
                                discovered_at: event.discovered_at,
                            };

                            // Save to database and publish event
                            this.scansService.addPortResult(scanId, port);
                            this.logger.debug(`[${scanId}] Found open port: ${event.subdomain}:${event.port} (${event.service})`);
                        }
                    } catch (error) {
                        this.logger.warn(`Failed to parse scanner output: ${line}`);
                    }
                }
            });

            process.stderr.on('data', (data) => {
                this.logger.error(`Port scanner error: ${data.toString()}`);
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    // Don't fail the whole scan if one port scan fails
                    this.logger.warn(`Port scanner for ${target} exited with code ${code}`);
                    resolve();
                }
            });

            process.on('error', (error) => {
                this.logger.error(`Failed to start port scanner: ${error.message}`);
                resolve(); // Continue with other scans
            });
        });
    }
}
