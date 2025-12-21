import { DatabaseService } from '../database/database.service';
import { PocService } from './poc.service';
import { ExecutePOCInput, ExecuteResponse } from './dto/poc.dto';
import { ExecutionLogsGateway } from './execution-logs.gateway';
export declare class ExecutionService {
    private readonly databaseService;
    private readonly pocService;
    private readonly executionLogsGateway;
    constructor(databaseService: DatabaseService, pocService: PocService, executionLogsGateway: ExecutionLogsGateway);
    private stripAnsiCodes;
    executePOC(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse>;
}
