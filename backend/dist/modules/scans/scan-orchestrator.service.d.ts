import { OnModuleInit } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScanEventsService } from './scan-events.service';
export declare class ScanOrchestratorService implements OnModuleInit {
    private readonly scansService;
    private readonly scanEventsService;
    private readonly logger;
    private readonly pythonPath;
    private readonly scannersPath;
    constructor(scansService: ScansService, scanEventsService: ScanEventsService);
    onModuleInit(): void;
    private executeScan;
    private runSubdomainEnum;
    private runPortScans;
    private runPortScan;
}
