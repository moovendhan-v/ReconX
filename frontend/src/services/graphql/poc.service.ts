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
      const { data } = await apolloClient.query<{ pocs: POCListResponse }>({
        query: GET_POCS,
        variables: { filters },
        fetchPolicy: 'network-only',
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.pocs;
    } catch (error) {
      console.error('Error fetching POCs:', error);
      throw new Error('Failed to fetch POCs');
    }
  }

  async getById(id: string): Promise<POC> {
    try {
      const { data } = await apolloClient.query<{ poc: POC }>({
        query: GET_POC,
        variables: { id },
        fetchPolicy: 'cache-first',
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.poc;
    } catch (error) {
      console.error('Error fetching POC:', error);
      throw new Error(`Failed to fetch POC with ID ${id}`);
    }
  }

  async getWithLogs(id: string): Promise<POC> {
    try {
      const { data } = await apolloClient.query<{ pocWithLogs: POC }>({
        query: GET_POC_WITH_LOGS,
        variables: { id },
        fetchPolicy: 'network-only',
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.pocWithLogs;
    } catch (error) {
      console.error('Error fetching POC with logs:', error);
      throw new Error(`Failed to fetch POC with logs for ID ${id}`);
    }
  }

  async getByCveId(cveId: string): Promise<POC[]> {
    try {
      const { data } = await apolloClient.query<{ pocsByCve: POC[] }>({
        query: GET_POCS_BY_CVE,
        variables: { cveId },
        fetchPolicy: 'network-only',
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.pocsByCve;
    } catch (error) {
      console.error('Error fetching POCs by CVE:', error);
      throw new Error(`Failed to fetch POCs for CVE ${cveId}`);
    }
  }

  async getLogs(pocId: string, limit: number = 50): Promise<ExecutionLog[]> {
    try {
      const { data } = await apolloClient.query<{ pocLogs: ExecutionLog[] }>({
        query: GET_POC_LOGS,
        variables: { pocId, limit },
        fetchPolicy: 'network-only',
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.pocLogs;
    } catch (error) {
      console.error('Error fetching POC logs:', error);
      throw new Error(`Failed to fetch logs for POC ${pocId}`);
    }
  }

  async create(input: CreatePOCInput): Promise<POC> {
    try {
      const { data } = await apolloClient.mutate<{ createPoc: POC }>({
        mutation: CREATE_POC,
        variables: { input },
        refetchQueries: [
          { query: GET_POCS },
          { query: GET_POCS_BY_CVE, variables: { cveId: input.cveId } }
        ],
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.createPoc;
    } catch (error) {
      console.error('Error creating POC:', error);
      throw new Error('Failed to create POC');
    }
  }

  async update(id: string, input: UpdatePOCInput): Promise<POC> {
    try {
      const { data } = await apolloClient.mutate<{ updatePoc: POC }>({
        mutation: UPDATE_POC,
        variables: { id, input },
        refetchQueries: [{ query: GET_POC, variables: { id } }],
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.updatePoc;
    } catch (error) {
      console.error('Error updating POC:', error);
      throw new Error(`Failed to update POC with ID ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate<{ deletePoc: boolean }>({
        mutation: DELETE_POC,
        variables: { id },
        refetchQueries: [{ query: GET_POCS }],
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.deletePoc;
    } catch (error) {
      console.error('Error deleting POC:', error);
      throw new Error(`Failed to delete POC with ID ${id}`);
    }
  }

  async execute(pocId: string, input: ExecutePOCInput): Promise<ExecuteResponse> {
    try {
      const { data } = await apolloClient.mutate<{ executePoc: ExecuteResponse }>({
        mutation: EXECUTE_POC,
        variables: { pocId, input },
        refetchQueries: [
          { query: GET_POC_LOGS, variables: { pocId, limit: 50 } },
          { query: GET_POC_WITH_LOGS, variables: { id: pocId } }
        ],
      });

      if (!data) throw new Error('No data returned from GraphQL');


      return data.executePoc;
    } catch (error) {
      console.error('Error executing POC:', error);
      throw new Error(`Failed to execute POC with ID ${pocId}`);
    }
  }

  async getRecentExecutions(limit: number = 100): Promise<ExecutionLog[]> {
    try {
      // Since we don't have a global logs query yet, we'll fetch recent POCs and aggregate their logs
      // This is a temporary solution until the backend supports global log querying
      const { pocs } = await this.getAll({ limit: 20 } as any); // Type cast as filters might not support limit yet but it's safe
      const allLogs: ExecutionLog[] = [];

      // Fetch logs for top 20 POCs in parallel
      const logPromises = pocs.slice(0, 20).map(poc =>
        this.getLogs(poc.id, 10).catch(() => [])
      );

      const results = await Promise.all(logPromises);
      results.forEach(logs => allLogs.push(...logs));

      return allLogs
        .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent executions:', error);
      return [];
    }
  }

  async getExecutionStatistics(pocId?: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  }> {
    try {
      let logs: ExecutionLog[] = [];

      if (pocId) {
        logs = await this.getLogs(pocId, 1000);
      } else {
        logs = await this.getRecentExecutions(1000);
      }

      const total = logs.length;
      const successful = logs.filter(log => log.status === 'SUCCESS').length;
      const failed = logs.filter(log => log.status === 'FAILED').length;
      const successRate = total > 0 ? (successful / total) * 100 : 0;

      return {
        total,
        successful,
        failed,
        successRate: Math.round(successRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error calculating execution statistics:', error);
      return { total: 0, successful: 0, failed: 0, successRate: 0 };
    }
  }
}

export const graphqlPocService = new GraphQLPOCService();