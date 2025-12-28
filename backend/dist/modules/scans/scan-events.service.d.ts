import { OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
export declare enum ScanEventType {
    CREATED = "scan.created",
    STARTED = "scan.started",
    PROGRESS = "scan.progress",
    SUBDOMAIN_FOUND = "scan.subdomain.found",
    PORTS_SCANNING = "scan.ports.scanning",
    PORT_FOUND = "scan.port.found",
    COMPLETED = "scan.completed",
    FAILED = "scan.failed"
}
export interface ScanEvent {
    type: ScanEventType;
    scanId: string;
    timestamp: string;
    data?: any;
}
export declare class ScanEventsService implements OnModuleInit {
    private readonly redisService;
    private readonly logger;
    private readonly SCAN_EVENTS_CHANNEL;
    private subscribers;
    constructor(redisService: RedisService);
    onModuleInit(): Promise<void>;
    publishEvent(type: ScanEventType, scanId: string, data?: any): Promise<void>;
    onEvent(handler: (event: ScanEvent) => void): void;
    scanCreated(scanId: string, target: string): Promise<void>;
    scanStarted(scanId: string): Promise<void>;
    scanProgress(scanId: string, progress: number): Promise<void>;
    subdomainFound(scanId: string, subdomain: any): Promise<void>;
    portsScanning(scanId: string, subdomain: string): Promise<void>;
    portFound(scanId: string, port: any): Promise<void>;
    scanCompleted(scanId: string, results: any): Promise<void>;
    scanFailed(scanId: string, error: string): Promise<void>;
}
