import { apolloClient } from '@/lib/apollo-client';
import { 
  GET_POCS, 
  GET_POC, 
  GET_POC_WITH_LOGS, 
  GET_POCS_BY_CVE, 
  GET_POC_LOGS,
  CREATE_POC,
  UPDATE_POC,
  DELETE_POC,
  EXECUTE_POC 
} from '@/graphql/queries/poc.queries';

export interface POCFilters {
  cveId?: string;
  language?: string;
  author?: string;
  search?: string;
}

export interface POC {
  id: string;
  cveId: string;
  name: string;
  description: string;
  language: string;
  scriptPath: string;
  usageExamples?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
  executionLogs?: ExecutionLog[];
}

export interface ExecutionLog {
  id: string;
  targetUrl?: string;
  command?: string;
  output?: string;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RUNNING';
  executedAt: string;
}

export interface POCListResponse {
  pocs: POC[];
  total: number;
}

export interface CreatePOCInput {
  cveId: string;
  name: string;
  description: string;
  language: string;
  scriptPath: string;
  usageExamples?: string;
  author?: string;
}

export interface UpdatePOCInput {
  name?: string;
  description?: string;
  language?: string;
  scriptPath?: string;
  usageExamples?: string;
  author?: string;
}

export interface ExecutePOCInput {
  targetUrl: string;
  command: string;
  additionalParams?: string;
}

export interface ExecuteResponse {
  message: string;
  result: {
    success: boolean;
    output: string;
    error?: string;
  };
  log: ExecutionLog;
}

export class GraphQLPOCService {
  async getAll(filters: POCFilters = {}): Promise<POCListResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_POCS,
        variables: { filters },
        fetchPolicy: 'cache-and-network',
      });
      
      return data.pocs;
    } catch (error) {
      console.error('Error fetching POCs:', error);
      throw new Error('Failed to fetch POCs');
    }
  }

  async getById(id: string): Promise<POC> {
    try {
      const { data } = await apolloClient.query({
        query: GET_POC,
        variables: { id },
        fetchPolicy: 'cache-first',
      });
      
      return data.poc;
    } catch (error) {
      console.error('Error fetching POC:', error);
      throw new Error(`Failed to fetch POC with ID ${id}`);
    }
  }

  async getWithLogs(id: string): Promise<POC> {
    try {
      const { data } = await apolloClient.query({
        query: GET_POC_WITH_LOGS,
        variables: { id },
        fetchPolicy: 'cache-and-network',
      });
      
      return data.pocWithLogs;
    } catch (error) {
      console.error('Error fetching POC with logs:', error);
      throw new Error(`Failed to fetch POC with logs for ID ${id}`);
    }
  }

  async getByCveId(cveId: string): Promise<POC[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_POCS_BY_CVE,
        variables: { cveId },
        fetchPolicy: 'cache-and-network',
      });
      
      return data.pocsByCve;
    } catch (error) {
      console.error('Error fetching POCs by CVE:', error);
      throw new Error(`Failed to fetch POCs for CVE ${cveId}`);
    }
  }

  async getLogs(pocId: string, limit: number = 50): Promise<ExecutionLog[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_POC_LOGS,
        variables: { pocId, limit },
        fetchPolicy: 'cache-and-network',
      });
      
      return data.pocLogs;
    } catch (error) {
      console.error('Error fetching POC logs:', error);
      throw new Error(`Failed to fetch logs for POC ${pocId}`);
    }
  }

  async create(input: CreatePOCInput): Promise<POC> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_POC,
        variables: { input },
        refetchQueries: [
          { query: GET_POCS },
          { query: GET_POCS_BY_CVE, variables: { cveId: input.cveId } }
        ],
      });
      
      return data.createPoc;
    } catch (error) {
      console.error('Error creating POC:', error);
      throw new Error('Failed to create POC');
    }
  }

  async update(id: string, input: UpdatePOCInput): Promise<POC> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_POC,
        variables: { id, input },
        refetchQueries: [{ query: GET_POC, variables: { id } }],
      });
      
      return data.updatePoc;
    } catch (error) {
      console.error('Error updating POC:', error);
      throw new Error(`Failed to update POC with ID ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_POC,
        variables: { id },
        refetchQueries: [{ query: GET_POCS }],
      });
      
      return data.deletePoc;
    } catch (error) {
      console.error('Error deleting POC:', error);
      throw new Error(`Failed to delete POC with ID ${id}`);
    }
  }

  async execute(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: EXECUTE_POC,
        variables: { pocId, input },
        refetchQueries: [
          { query: GET_POC_LOGS, variables: { pocId, limit: 50 } },
          { query: GET_POC_WITH_LOGS, variables: { id: pocId } }
        ],
      });
      
      return data.executePoc;
    } catch (error) {
      console.error('Error executing POC:', error);
      throw new Error(`Failed to execute POC with ID ${pocId}`);
    }
  }
}

export const graphqlPocService = new GraphQLPOCService();