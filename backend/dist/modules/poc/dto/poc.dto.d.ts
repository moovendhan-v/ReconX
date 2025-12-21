import { CVE } from '../../cve/dto/cve.dto';
export declare enum ExecutionStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    TIMEOUT = "TIMEOUT",
    RUNNING = "RUNNING"
}
export declare class POC {
    id: string;
    cveId: string;
    name: string;
    description: string;
    language: string;
    scriptPath: string;
    usageExamples?: string;
    author?: string;
    createdAt: Date;
    updatedAt: Date;
    cve?: CVE;
    executionLogs?: ExecutionLog[];
}
export declare class ExecutionLog {
    id: string;
    pocId: string;
    targetUrl?: string;
    command?: string;
    output?: string;
    status: ExecutionStatus;
    executedAt: Date;
    poc?: POC;
}
export declare class CreatePOCInput {
    cveId: string;
    name: string;
    description: string;
    language: string;
    scriptPath: string;
    usageExamples?: string;
    author?: string;
}
export declare class UpdatePOCInput {
    name?: string;
    description?: string;
    language?: string;
    scriptPath?: string;
    usageExamples?: string;
    author?: string;
}
export declare class ExecutePOCInput {
    targetUrl: string;
    command: string;
    additionalParams?: string;
}
export declare class ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
}
export declare class ExecuteResponse {
    message: string;
    result: ExecutionResult;
    log: ExecutionLog;
}
export declare class POCFiltersInput {
    cveId?: string;
    language?: string;
    author?: string;
    search?: string;
    limit?: number;
    offset?: number;
}
export declare class POCListResponse {
    pocs: POC[];
    total: number;
}
