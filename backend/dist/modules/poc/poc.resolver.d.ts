import { PocService } from './poc.service';
import { ExecutionService } from './execution.service';
import { POC, CreatePOCInput, UpdatePOCInput, POCFiltersInput, POCListResponse, ExecutePOCInput, ExecuteResponse, ExecutionLog } from './dto/poc.dto';
import { CVE } from '../cve/dto/cve.dto';
export declare class PocResolver {
    private readonly pocService;
    private readonly executionService;
    constructor(pocService: PocService, executionService: ExecutionService);
    findAll(filters?: POCFiltersInput): Promise<POCListResponse>;
    findOne(id: string): Promise<POC>;
    findWithLogs(id: string): Promise<POC>;
    findByCveId(cveId: string): Promise<POC[]>;
    getLogs(pocId: string, limit?: number): Promise<ExecutionLog[]>;
    createPoc(input: CreatePOCInput): Promise<POC>;
    updatePoc(id: string, input: UpdatePOCInput): Promise<POC>;
    deletePoc(id: string): Promise<boolean>;
    executePoc(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse>;
    cve(poc: POC): Promise<CVE>;
    executionLogs(poc: POC): Promise<ExecutionLog[]>;
}
