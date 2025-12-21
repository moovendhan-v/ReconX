export declare enum ReportType {
    SCAN = "SCAN",
    CVE = "CVE",
    POC = "POC",
    CUSTOM = "CUSTOM"
}
export declare class Report {
    id: string;
    title: string;
    type: ReportType;
    content: any;
    generatedBy?: string;
    createdAt: Date;
}
export declare class CreateReportInput {
    title: string;
    type: ReportType;
    content: any;
    generatedBy?: string;
}
export declare class ReportFiltersInput {
    search?: string;
    type?: ReportType;
    limit?: number;
    offset?: number;
}
export declare class ReportListResponse {
    reports: Report[];
    total: number;
}
