import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateReportInput, ReportFiltersInput, ReportListResponse, Report as ReportDTO } from './dto/report.dto';
export declare class ReportsService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    findAll(filters?: ReportFiltersInput): Promise<ReportListResponse>;
    findById(id: string): Promise<ReportDTO | null>;
    create(input: CreateReportInput): Promise<ReportDTO>;
    delete(id: string): Promise<boolean>;
}
