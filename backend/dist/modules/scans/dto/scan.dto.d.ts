export declare enum ScanType {
    QUICK = "QUICK",
    FULL = "FULL",
    CUSTOM = "CUSTOM"
}
export declare enum ScanStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare enum PortState {
    OPEN = "open",
    CLOSED = "closed",
    FILTERED = "filtered"
}
export declare class SubdomainResult {
    subdomain: string;
    ip: string[];
    discovered_at: string;
}
export declare class PortResult {
    subdomain: string;
    port: number;
    service: string;
    state: PortState;
    discovered_at: string;
}
export declare class Scan {
    id: string;
    name: string;
    target: string;
    type: ScanType;
    status: ScanStatus;
    progress?: number;
    results?: any;
    subdomains?: SubdomainResult[];
    openPorts?: PortResult[];
    error?: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateScanInput {
    name: string;
    target: string;
    type: ScanType;
}
export declare class UpdateScanInput {
    name?: string;
    status?: ScanStatus;
    results?: any;
}
export declare class ScanFiltersInput {
    search?: string;
    status?: ScanStatus;
    type?: ScanType;
    limit?: number;
    offset?: number;
}
export declare class ScanListResponse {
    scans: Scan[];
    total: number;
}
