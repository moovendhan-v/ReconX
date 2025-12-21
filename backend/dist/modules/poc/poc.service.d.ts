import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { POC, CreatePOCInput, UpdatePOCInput, POCFiltersInput, POCListResponse, ExecutionLog } from './dto/poc.dto';
export declare class PocService {
    private readonly databaseService;
    private readonly redisService;
    constructor(databaseService: DatabaseService, redisService: RedisService);
    findAll(filters?: POCFiltersInput): Promise<POCListResponse>;
    findOne(id: string): Promise<POC>;
    findWithLogs(id: string): Promise<POC>;
    findByCveId(cveId: string): Promise<POC[]>;
    create(input: CreatePOCInput): Promise<POC>;
    update(id: string, input: UpdatePOCInput): Promise<POC>;
    remove(id: string): Promise<boolean>;
    getLogs(pocId: string, limit?: number): Promise<ExecutionLog[]>;
    private mapPOCFromDb;
}
