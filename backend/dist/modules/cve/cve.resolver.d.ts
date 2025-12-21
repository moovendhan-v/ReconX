import { CveService } from './cve.service';
import { CVE, CreateCVEInput, UpdateCVEInput, CVEFiltersInput, CVEListResponse, CVEStatistics } from './dto/cve.dto';
import { POC } from '../poc/dto/poc.dto';
export declare class CveResolver {
    private readonly cveService;
    constructor(cveService: CveService);
    findAll(filters?: CVEFiltersInput): Promise<CVEListResponse>;
    findOne(id: string): Promise<CVE>;
    findByCveId(cveId: string): Promise<CVE>;
    findWithPocs(id: string): Promise<CVE>;
    search(query: string): Promise<CVE[]>;
    getStatistics(): Promise<CVEStatistics>;
    createCve(input: CreateCVEInput): Promise<CVE>;
    updateCve(id: string, input: UpdateCVEInput): Promise<CVE>;
    deleteCve(id: string): Promise<boolean>;
    pocs(cve: CVE): Promise<POC[]>;
}
