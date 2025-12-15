import { apolloClient } from '@/lib/apollo-client';
import { 
  GET_CVES, 
  GET_CVE, 
  GET_CVE_WITH_POCS, 
  SEARCH_CVES, 
  GET_CVE_STATISTICS,
  CREATE_CVE,
  UPDATE_CVE,
  DELETE_CVE 
} from '@/graphql/queries/cve.queries';

export interface CVEFilters {
  search?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CVE {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cvssScore?: string;
  publishedDate?: string;
  affectedProducts?: string[];
  references?: string[];
  createdAt: string;
  updatedAt: string;
  pocs?: POC[];
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
}

export interface CVEListResponse {
  cves: CVE[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CVEStatistics {
  total: number;
  bySeverity: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  recent: number;
}

export interface CreateCVEInput {
  cveId: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cvssScore?: string;
  publishedDate?: string;
  affectedProducts?: string[];
  references?: string[];
}

export interface UpdateCVEInput {
  title?: string;
  description?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cvssScore?: string;
  publishedDate?: string;
  affectedProducts?: string[];
  references?: string[];
}

export class GraphQLCVEService {
  async getAll(filters: CVEFilters = {}): Promise<CVEListResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CVES,
        variables: { filters },
        fetchPolicy: 'cache-and-network',
      });
      
      return data.cves;
    } catch (error) {
      console.error('Error fetching CVEs:', error);
      throw new Error('Failed to fetch CVEs');
    }
  }

  async getById(id: string): Promise<CVE> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CVE,
        variables: { id },
        fetchPolicy: 'cache-first',
      });
      
      return data.cve;
    } catch (error) {
      console.error('Error fetching CVE:', error);
      throw new Error(`Failed to fetch CVE with ID ${id}`);
    }
  }

  async getWithPocs(id: string): Promise<CVE> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CVE_WITH_POCS,
        variables: { id },
        fetchPolicy: 'cache-and-network',
      });
      
      return data.cveWithPocs;
    } catch (error) {
      console.error('Error fetching CVE with POCs:', error);
      throw new Error(`Failed to fetch CVE with POCs for ID ${id}`);
    }
  }

  async search(query: string): Promise<CVE[]> {
    try {
      const { data } = await apolloClient.query({
        query: SEARCH_CVES,
        variables: { query },
        fetchPolicy: 'cache-and-network',
      });
      
      return data.searchCves;
    } catch (error) {
      console.error('Error searching CVEs:', error);
      throw new Error('Failed to search CVEs');
    }
  }

  async getStatistics(): Promise<CVEStatistics> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CVE_STATISTICS,
        fetchPolicy: 'cache-and-network',
      });
      
      return data.cveStatistics;
    } catch (error) {
      console.error('Error fetching CVE statistics:', error);
      throw new Error('Failed to fetch CVE statistics');
    }
  }

  async create(input: CreateCVEInput): Promise<CVE> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_CVE,
        variables: { input },
        refetchQueries: [{ query: GET_CVES }, { query: GET_CVE_STATISTICS }],
      });
      
      return data.createCve;
    } catch (error) {
      console.error('Error creating CVE:', error);
      throw new Error('Failed to create CVE');
    }
  }

  async update(id: string, input: UpdateCVEInput): Promise<CVE> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_CVE,
        variables: { id, input },
        refetchQueries: [{ query: GET_CVE, variables: { id } }],
      });
      
      return data.updateCve;
    } catch (error) {
      console.error('Error updating CVE:', error);
      throw new Error(`Failed to update CVE with ID ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_CVE,
        variables: { id },
        refetchQueries: [{ query: GET_CVES }, { query: GET_CVE_STATISTICS }],
      });
      
      return data.deleteCve;
    } catch (error) {
      console.error('Error deleting CVE:', error);
      throw new Error(`Failed to delete CVE with ID ${id}`);
    }
  }
}

export const graphqlCveService = new GraphQLCVEService();