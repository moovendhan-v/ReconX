import type { 
  CVE, 
  CVEService, 
  CVEListResponse, 
  CVEDetailResponse, 
  CVEFilters
} from '../types';
import { BaseAPIService } from './base-api.service';
import { withErrorHandling } from '../lib/error-handler';

export class CVEServiceImpl extends BaseAPIService implements CVEService {
  private readonly endpoint = '/cves';

  /**
   * Get all CVEs with optional filtering and pagination
   */
  public getAll = withErrorHandling(async (filters: CVEFilters = {}): Promise<CVEListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

    return this.get<CVEListResponse>(url);
  }, { component: 'CVEService', action: 'Get All CVEs' });

  /**
   * Get a single CVE by ID with associated POCs
   */
  public async getById(id: string): Promise<CVEDetailResponse> {
    if (!id || typeof id !== 'string') {
      throw new Error('CVE ID is required and must be a string');
    }

    return this.get<CVEDetailResponse>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  /**
   * Create a new CVE
   */
  public async create(data: Partial<CVE>): Promise<CVE> {
    this.validateCVEData(data);
    return this.post<CVE>(this.endpoint, data);
  }

  /**
   * Update an existing CVE
   */
  public async update(id: string, data: Partial<CVE>): Promise<CVE> {
    if (!id || typeof id !== 'string') {
      throw new Error('CVE ID is required and must be a string');
    }

    this.validateCVEData(data, true);
    return this.put<CVE>(`${this.endpoint}/${encodeURIComponent(id)}`, data);
  }

  /**
   * Delete a CVE
   */
  public async delete(id: string): Promise<{ message: string }> {
    if (!id || typeof id !== 'string') {
      throw new Error('CVE ID is required and must be a string');
    }

    return this.deleteRequest<{ message: string }>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  /**
   * Search CVEs by query string
   */
  public async search(query: string): Promise<CVE[]> {
    if (!query || typeof query !== 'string') {
      throw new Error('Search query is required and must be a string');
    }

    const response = await this.getAll({ search: query, limit: 100 });
    return response.cves;
  }

  /**
   * Get CVEs by severity level
   */
  public async getBySeverity(severity: CVE['severity']): Promise<CVE[]> {
    const response = await this.getAll({ severity, limit: 1000 });
    return response.cves;
  }

  /**
   * Get recent CVEs (published in last N days)
   */
  public async getRecent(days: number = 30): Promise<CVE[]> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    const response = await this.getAll({ 
      dateFrom: dateFrom.toISOString().split('T')[0],
      limit: 1000 
    });
    return response.cves;
  }

  /**
   * Get CVE statistics
   */
  public async getStatistics(): Promise<{
    total: number;
    bySeverity: Record<CVE['severity'], number>;
    recent: number;
  }> {
    // Get all CVEs to calculate statistics
    const allCVEs = await this.getAll({ limit: 10000 });
    const recentCVEs = await this.getRecent(30);

    const bySeverity = allCVEs.cves.reduce((acc, cve) => {
      acc[cve.severity] = (acc[cve.severity] || 0) + 1;
      return acc;
    }, {} as Record<CVE['severity'], number>);

    return {
      total: allCVEs.total,
      bySeverity,
      recent: recentCVEs.length,
    };
  }

  /**
   * Validate CVE data before sending to API
   */
  private validateCVEData(data: Partial<CVE>, isUpdate: boolean = false): void {
    if (!isUpdate) {
      if (!data.cveId) {
        throw new Error('CVE ID is required');
      }
      if (!data.title) {
        throw new Error('CVE title is required');
      }
      if (!data.description) {
        throw new Error('CVE description is required');
      }
      if (!data.severity) {
        throw new Error('CVE severity is required');
      }
    }

    if (data.severity && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(data.severity)) {
      throw new Error('Invalid severity level');
    }

    if (data.cvssScore && (isNaN(parseFloat(data.cvssScore)) || parseFloat(data.cvssScore) < 0 || parseFloat(data.cvssScore) > 10)) {
      throw new Error('CVSS score must be a number between 0 and 10');
    }

    if (data.cveId && !/^CVE-\d{4}-\d{4,}$/.test(data.cveId)) {
      throw new Error('Invalid CVE ID format. Expected format: CVE-YYYY-NNNN');
    }
  }
}

// Export singleton instance
export const cveService = new CVEServiceImpl();