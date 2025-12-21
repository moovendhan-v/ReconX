import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { CVE, CreateCVEInput, UpdateCVEInput, CVEFiltersInput, CVEListResponse, CVEStatistics } from './dto/cve.dto';
export declare class CveService {
    private readonly databaseService;
    private readonly redisService;
    constructor(databaseService: DatabaseService, redisService: RedisService);
    findAll(filters?: CVEFiltersInput): Promise<CVEListResponse>;
    findOne(id: string): Promise<CVE>;
    findByCveId(cveId: string): Promise<CVE>;
    findWithPocs(id: string): Promise<CVE>;
    create(input: CreateCVEInput): Promise<CVE>;
    update(id: string, input: UpdateCVEInput): Promise<CVE>;
    remove(id: string): Promise<boolean>;
    search(query: string): Promise<CVE[]>;
    getStatistics(): Promise<CVEStatistics>;
    private mapCVEFromDb;
}
