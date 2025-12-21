import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateScanInput, UpdateScanInput, ScanFiltersInput, ScanListResponse, Scan as ScanDTO } from './dto/scan.dto';
export declare class ScansService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    findAll(filters?: ScanFiltersInput): Promise<ScanListResponse>;
    findById(id: string): Promise<ScanDTO | null>;
    create(input: CreateScanInput): Promise<ScanDTO>;
    update(id: string, input: UpdateScanInput): Promise<ScanDTO>;
    delete(id: string): Promise<boolean>;
    startScan(id: string): Promise<ScanDTO>;
}
