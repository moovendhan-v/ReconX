import { POC } from '../../poc/dto/poc.dto';
export declare enum Severity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL"
}
export declare class CVE {
    id: string;
    cveId: string;
    title: string;
    description: string;
    severity: Severity;
    cvssScore?: string;
    publishedDate?: Date;
    affectedProducts?: string[];
    references?: string[];
    createdAt: Date;
    updatedAt: Date;
    pocs?: POC[];
}
export declare class CreateCVEInput {
    cveId: string;
    title: string;
    description: string;
    severity: Severity;
    cvssScore?: string;
    publishedDate?: string;
    affectedProducts?: string[];
    references?: string[];
}
export declare class UpdateCVEInput {
    title?: string;
    description?: string;
    severity?: Severity;
    cvssScore?: string;
    publishedDate?: string;
    affectedProducts?: string[];
    references?: string[];
}
export declare class CVEFiltersInput {
    search?: string;
    severity?: Severity;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}
export declare class CVEListResponse {
    cves: CVE[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class CVESeverityStats {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
}
export declare class CVEStatistics {
    total: number;
    bySeverity: CVESeverityStats;
    recent: number;
}
