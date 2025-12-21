import { DatabaseService } from '../database/database.service';
import { PocService } from './poc.service';
import { ExecutePOCInput, ExecuteResponse } from './dto/poc.dto';
export declare class ExecutionService {
    private readonly databaseService;
    private readonly pocService;
    constructor(databaseService: DatabaseService, pocService: PocService);
    executePOC(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse>;
}
