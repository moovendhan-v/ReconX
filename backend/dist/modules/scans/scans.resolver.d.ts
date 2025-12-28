import { ScansService } from './scans.service';
import { Scan, CreateScanInput, UpdateScanInput, ScanFiltersInput, ScanListResponse } from './dto/scan.dto';
export declare class ScansResolver {
    private readonly scansService;
    constructor(scansService: ScansService);
    findAll(filters?: ScanFiltersInput): Promise<ScanListResponse>;
    findById(id: string): Promise<Scan | null>;
    createScan(input: CreateScanInput): Promise<Scan>;
    updateScan(id: string, input: UpdateScanInput): Promise<Scan>;
    deleteScan(id: string): Promise<boolean>;
    startScan(id: string): Promise<Scan>;
    startQuickScan(target: string): Promise<Scan>;
}
