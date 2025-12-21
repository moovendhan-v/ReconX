import { PocService } from './poc.service';
import { ExecutionService } from './execution.service';
import type { User } from '../../db/schema';
import { POC, CreatePOCInput, UpdatePOCInput, POCFiltersInput, POCListResponse, ExecutePOCInput, ExecuteResponse, ExecutionLog } from './dto/poc.dto';
import { CVE } from '../cve/dto/cve.dto';
export declare class PocResolver {
    private readonly pocService;
    private readonly executionService;
    constructor(pocService: PocService, executionService: ExecutionService);
    findAll(user: User, filters?: POCFiltersInput): Promise<POCListResponse>;
    findOne(user: User, id: string): Promise<POC>;
    findWithLogs(user: User, id: string): Promise<POC>;
    findByCveId(user: User, cveId: string): Promise<POC[]>;
    getLogs(user: User, pocId: string, limit?: number): Promise<ExecutionLog[]>;
    createPoc(user: User, input: CreatePOCInput): Promise<POC>;
    updatePoc(user: User, id: string, input: UpdatePOCInput): Promise<POC>;
    deletePoc(user: User, id: string): Promise<boolean>;
    executePoc(user: User, pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse>;
    cve(poc: POC): Promise<CVE>;
    executionLogs(poc: POC, user: User): Promise<ExecutionLog[]>;
}
