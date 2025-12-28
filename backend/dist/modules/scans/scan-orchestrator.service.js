"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScanOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const scans_service_1 = require("./scans.service");
const scan_events_service_1 = require("./scan-events.service");
const path_1 = require("path");
let ScanOrchestratorService = ScanOrchestratorService_1 = class ScanOrchestratorService {
    constructor(scansService, scanEventsService) {
        this.scansService = scansService;
        this.scanEventsService = scanEventsService;
        this.logger = new common_1.Logger(ScanOrchestratorService_1.name);
        this.pythonPath = 'python3';
        this.scannersPath = (0, path_1.join)(process.cwd(), 'python-core', 'scanners');
    }
    onModuleInit() {
        this.scanEventsService.onEvent((event) => {
            if (event.type === scan_events_service_1.ScanEventType.CREATED) {
                this.logger.log(`New scan created: ${event.scanId}, starting execution`);
                this.executeScan(event.scanId, event.data.target);
            }
        });
        this.logger.log('✓ Scan Orchestrator initialized');
    }
    async executeScan(scanId, target) {
        try {
            await this.scansService.update(scanId, { status: 'RUNNING' });
            await this.scansService.updateProgress(scanId, 0);
            await this.scanEventsService.scanStarted(scanId);
            this.logger.log(`[${scanId}] Starting subdomain enumeration for ${target}`);
            const subdomains = await this.runSubdomainEnum(scanId, target);
            if (subdomains.length === 0) {
                this.logger.warn(`[${scanId}] No subdomains found, using root domain only`);
                subdomains.push({ subdomain: target, ip: [], discovered_at: new Date().toISOString() });
            }
            await this.scansService.updateProgress(scanId, 50);
            this.logger.log(`[${scanId}] Starting port scanning for ${subdomains.length} subdomains`);
            await this.runPortScans(scanId, subdomains);
            await this.scansService.completeScan(scanId);
            this.logger.log(`[${scanId}] Scan completed successfully`);
        }
        catch (error) {
            this.logger.error(`[${scanId}] Scan failed: ${error.message}`);
            await this.scansService.failScan(scanId, error.message);
        }
    }
    async runSubdomainEnum(scanId, target) {
        return new Promise((resolve, reject) => {
            const subdomains = [];
            const scriptPath = (0, path_1.join)(this.scannersPath, 'subdomain_enum.py');
            const process = (0, child_process_1.spawn)(this.pythonPath, [scriptPath, target]);
            process.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (!line.trim())
                        continue;
                    try {
                        const event = JSON.parse(line);
                        if (event.type === 'subdomain') {
                            const subdomain = {
                                subdomain: event.subdomain,
                                ip: event.ip,
                                discovered_at: event.discovered_at,
                            };
                            subdomains.push(subdomain);
                            this.scansService.addSubdomainResult(scanId, subdomain);
                            this.logger.debug(`[${scanId}] Found subdomain: ${event.subdomain}`);
                        }
                        else if (event.type === 'progress') {
                            const overallProgress = Math.floor(event.percent * 0.5);
                            this.scansService.updateProgress(scanId, overallProgress);
                        }
                    }
                    catch (error) {
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
                }
                else {
                    reject(new Error(`Subdomain scanner exited with code ${code}`));
                }
            });
            process.on('error', (error) => {
                reject(new Error(`Failed to start subdomain scanner: ${error.message}`));
            });
        });
    }
    async runPortScans(scanId, subdomains) {
        const totalSubdomains = subdomains.length;
        let completed = 0;
        const subdomainsToScan = subdomains.slice(0, 3);
        for (const subdomain of subdomainsToScan) {
            await this.scanEventsService.portsScanning(scanId, subdomain.subdomain);
            await this.runPortScan(scanId, subdomain.subdomain);
            completed++;
            const overallProgress = Math.floor(50 + (completed / totalSubdomains) * 50);
            await this.scansService.updateProgress(scanId, overallProgress);
        }
    }
    async runPortScan(scanId, target) {
        return new Promise((resolve, reject) => {
            const scriptPath = (0, path_1.join)(this.scannersPath, 'port_scanner.py');
            const process = (0, child_process_1.spawn)(this.pythonPath, [scriptPath, target]);
            process.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                for (const line of lines) {
                    if (!line.trim())
                        continue;
                    try {
                        const event = JSON.parse(line);
                        if (event.type === 'port') {
                            const port = {
                                subdomain: event.subdomain,
                                port: event.port,
                                service: event.service,
                                state: event.state,
                                discovered_at: event.discovered_at,
                            };
                            this.scansService.addPortResult(scanId, port);
                            this.logger.debug(`[${scanId}] Found open port: ${event.subdomain}:${event.port} (${event.service})`);
                        }
                    }
                    catch (error) {
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
                }
                else {
                    this.logger.warn(`Port scanner for ${target} exited with code ${code}`);
                    resolve();
                }
            });
            process.on('error', (error) => {
                this.logger.error(`Failed to start port scanner: ${error.message}`);
                resolve();
            });
        });
    }
};
exports.ScanOrchestratorService = ScanOrchestratorService;
exports.ScanOrchestratorService = ScanOrchestratorService = ScanOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scans_service_1.ScansService,
        scan_events_service_1.ScanEventsService])
], ScanOrchestratorService);
//# sourceMappingURL=scan-orchestrator.service.js.map