import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateScanInput, UpdateScanInput, ScanFiltersInput, ScanListResponse, Scan as ScanDTO } from './dto/scan.dto';
import { SubdomainResult, PortResult } from '../../db/schema';
import { ScanEventsService } from './scan-events.service';
export declare class ScansService {
    private db;
    private readonly scanEventsService;
    constructor(db: NodePgDatabase<typeof schema>, scanEventsService: ScanEventsService);
    private transformScanToDTO;
    findAll(filters?: ScanFiltersInput): Promise<ScanListResponse>;
    findById(id: string): Promise<ScanDTO | null>;
    create(input: CreateScanInput): Promise<ScanDTO>;
    update(id: string, input: UpdateScanInput): Promise<ScanDTO>;
    delete(id: string): Promise<boolean>;
    startScan(id: string): Promise<ScanDTO>;
    startQuickScan(target: string): Promise<ScanDTO>;
    updateProgress(id: string, progress: number): Promise<void>;
    addSubdomainResult(id: string, subdomain: SubdomainResult): Promise<void>;
    addPortResult(id: string, port: PortResult): Promise<void>;
    completeScan(id: string): Promise<ScanDTO>;
    failScan(id: string, error: string): Promise<ScanDTO>;
}
