import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export enum ScanEventType {
    CREATED = 'scan.created',
    STARTED = 'scan.started',
    PROGRESS = 'scan.progress',
    SUBDOMAIN_FOUND = 'scan.subdomain.found',
    PORTS_SCANNING = 'scan.ports.scanning',
    PORT_FOUND = 'scan.port.found',
    COMPLETED = 'scan.completed',
    FAILED = 'scan.failed',
}

export interface ScanEvent {
    type: ScanEventType;
    scanId: string;
    timestamp: string;
    data?: any;
}

@Injectable()
export class ScanEventsService implements OnModuleInit {
    private readonly logger = new Logger(ScanEventsService.name);
    private readonly SCAN_EVENTS_CHANNEL = 'scan:events';
    private subscribers: Array<(event: ScanEvent) => void> = [];

    constructor(private readonly redisService: RedisService) { }

    async onModuleInit() {
        // Subscribe to scan events channel
        const client = this.redisService.getClient();
        if (!client) {
            this.logger.warn('Redis not available, events will not be published');
            return;
        }

        try {
            const subscriber = client.duplicate();
            await subscriber.connect();

            await subscriber.subscribe(this.SCAN_EVENTS_CHANNEL, (message) => {
                try {
                    const event = JSON.parse(message) as ScanEvent;
                    this.logger.debug(`Received event: ${event.type} for scan ${event.scanId}`);

                    // Notify all subscribers
                    this.subscribers.forEach(handler => {
                        try {
                            handler(event);
                        } catch (error) {
                            this.logger.error(`Error in event handler: ${error.message}`);
                        }
                    });
                } catch (error) {
                    this.logger.error(`Failed to parse scan event: ${error.message}`);
                }
            });

            this.logger.log('✓ Subscribed to scan events channel');
        } catch (error) {
            this.logger.error(`Failed to subscribe to scan events: ${error.message}`);
        }
    }

    /**
     * Publish a scan event to Redis
     */
    async publishEvent(type: ScanEventType, scanId: string, data?: any): Promise<void> {
        const event: ScanEvent = {
            type,
            scanId,
            timestamp: new Date().toISOString(),
            data,
        };

        const client = this.redisService.getClient();
        if (!client) {
            this.logger.warn(`Cannot publish event ${type}, Redis not available`);
            return;
        }

        try {
            await client.publish(this.SCAN_EVENTS_CHANNEL, JSON.stringify(event));
            this.logger.debug(`Published event: ${type} for scan ${scanId}`);
        } catch (error) {
            this.logger.error(`Failed to publish event: ${error.message}`);
        }
    }

    /**
     * Subscribe to scan events
     */
    onEvent(handler: (event: ScanEvent) => void): void {
        this.subscribers.push(handler);
    }

    /**
     * Convenience methods for common events
     */
    async scanCreated(scanId: string, target: string): Promise<void> {
        await this.publishEvent(ScanEventType.CREATED, scanId, { target });
    }

    async scanStarted(scanId: string): Promise<void> {
        await this.publishEvent(ScanEventType.STARTED, scanId);
    }

    async scanProgress(scanId: string, progress: number): Promise<void> {
        await this.publishEvent(ScanEventType.PROGRESS, scanId, { progress });
    }

    async subdomainFound(scanId: string, subdomain: any): Promise<void> {
        await this.publishEvent(ScanEventType.SUBDOMAIN_FOUND, scanId, subdomain);
    }

    async portsScanning(scanId: string, subdomain: string): Promise<void> {
        await this.publishEvent(ScanEventType.PORTS_SCANNING, scanId, { subdomain });
    }

    async portFound(scanId: string, port: any): Promise<void> {
        await this.publishEvent(ScanEventType.PORT_FOUND, scanId, port);
    }

    async scanCompleted(scanId: string, results: any): Promise<void> {
        await this.publishEvent(ScanEventType.COMPLETED, scanId, results);
    }

    async scanFailed(scanId: string, error: string): Promise<void> {
        await this.publishEvent(ScanEventType.FAILED, scanId, { error });
    }
}
