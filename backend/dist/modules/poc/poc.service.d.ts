import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { POC, CreatePOCInput, UpdatePOCInput, POCFiltersInput, POCListResponse, ExecutionLog } from './dto/poc.dto';
export declare class PocService {
    private readonly databaseService;
    private readonly redisService;
    constructor(databaseService: DatabaseService, redisService: RedisService);
    findAll(userId: string, filters?: POCFiltersInput): Promise<POCListResponse>;
    findOne(id: string, userId: string): Promise<POC>;
    findWithLogs(id: string, userId: string): Promise<POC>;
    findByCveId(cveId: string, userId: string): Promise<POC[]>;
    create(input: CreatePOCInput, userId: string): Promise<POC>;
    update(id: string, input: UpdatePOCInput, userId: string): Promise<POC>;
    remove(id: string, userId: string): Promise<boolean>;
    getLogs(pocId: string, userId: string, limit?: number): Promise<ExecutionLog[]>;
    private mapPOCFromDb;
}
