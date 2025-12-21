// Export GraphQL services as the primary API services
export { graphqlCveService as cveService } from './graphql/cve.service';
export { graphqlPocService as pocService } from './graphql/poc.service';

// Re-export types
export type {
    CVE,
    CVEFilters,
    CVEListResponse,
    CVEStatistics,
    CreateCVEInput,
    UpdateCVEInput
} from './graphql/cve.service';

export type {
    POC,
    POCFilters,
    POCListResponse,
    CreatePOCInput,
    UpdatePOCInput,
    ExecutePOCInput,
    ExecuteResponse,
    ExecutionLog
} from './graphql/poc.service';
