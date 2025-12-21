import { ReportsService } from './reports.service';
import { Report, CreateReportInput, ReportFiltersInput, ReportListResponse } from './dto/report.dto';
export declare class ReportsResolver {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    findAll(filters?: ReportFiltersInput): Promise<ReportListResponse>;
    findById(id: string): Promise<Report | null>;
    createReport(input: CreateReportInput): Promise<Report>;
    deleteReport(id: string): Promise<boolean>;
}
