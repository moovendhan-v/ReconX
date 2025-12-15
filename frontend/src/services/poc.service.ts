import type { 
  POC, 
  POCService, 
  POCDetailResponse, 
  POCFilters,
  ExecuteRequest,
  ExecuteResponse,
  ExecutionLog
} from '../types';
import { BaseAPIService } from './base-api.service';

export class POCServiceImpl extends BaseAPIService implements POCService {
  private readonly endpoint = '/pocs';

  /**
   * Get all POCs with optional filtering
   */
  public async getAll(filters: POCFilters = {}): Promise<POC[]> {
    const params = new URLSearchParams();
    
    if (filters.cveId) params.append('cveId', filters.cveId);
    if (filters.language) params.append('language', filters.language);
    if (filters.author) params.append('author', filters.author);

    const queryString = params.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

    return this.get<POC[]>(url);
  }

  /**
   * Get a single POC by ID with execution logs and script content
   */
  public async getById(id: string): Promise<POCDetailResponse> {
    if (!id || typeof id !== 'string') {
      throw new Error('POC ID is required and must be a string');
    }

    return this.get<POCDetailResponse>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  /**
   * Upload a new POC script
   */
  public async upload(formData: FormData): Promise<POC> {
    if (!formData) {
      throw new Error('Form data is required');
    }

    // Validate required fields
    if (!formData.get('script')) {
      throw new Error('Script file is required');
    }
    if (!formData.get('cveId')) {
      throw new Error('CVE ID is required');
    }
    if (!formData.get('name')) {
      throw new Error('POC name is required');
    }

    return this.post<POC>(this.endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Execute a POC script
   */
  public async execute(id: string, request: ExecuteRequest): Promise<ExecuteResponse> {
    if (!id || typeof id !== 'string') {
      throw new Error('POC ID is required and must be a string');
    }

    this.validateExecuteRequest(request);

    return this.post<ExecuteResponse>(
      `${this.endpoint}/${encodeURIComponent(id)}/execute`,
      request,
      {
        timeout: 60000, // Extended timeout for POC execution
        retries: 1, // Reduced retries for execution to avoid duplicate runs
      }
    );
  }

  /**
   * Get execution logs for a POC
   */
  public async getLogs(id: string, limit: number = 50): Promise<ExecutionLog[]> {
    if (!id || typeof id !== 'string') {
      throw new Error('POC ID is required and must be a string');
    }

    if (limit <= 0 || limit > 1000) {
      throw new Error('Limit must be between 1 and 1000');
    }

    const params = new URLSearchParams({ limit: limit.toString() });
    return this.get<ExecutionLog[]>(`${this.endpoint}/${encodeURIComponent(id)}/logs?${params}`);
  }

  /**
   * Delete a POC
   */
  public async delete(id: string): Promise<{ message: string }> {
    if (!id || typeof id !== 'string') {
      throw new Error('POC ID is required and must be a string');
    }

    return this.deleteRequest<{ message: string }>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  /**
   * Get POCs by CVE ID
   */
  public async getByCVE(cveId: string): Promise<POC[]> {
    if (!cveId || typeof cveId !== 'string') {
      throw new Error('CVE ID is required and must be a string');
    }

    return this.getAll({ cveId });
  }

  /**
   * Get POCs by programming language
   */
  public async getByLanguage(language: string): Promise<POC[]> {
    if (!language || typeof language !== 'string') {
      throw new Error('Language is required and must be a string');
    }

    return this.getAll({ language });
  }

  /**
   * Get POCs by author
   */
  public async getByAuthor(author: string): Promise<POC[]> {
    if (!author || typeof author !== 'string') {
      throw new Error('Author is required and must be a string');
    }

    return this.getAll({ author });
  }

  /**
   * Get recent execution logs across all POCs
   */
  public async getRecentExecutions(limit: number = 100): Promise<ExecutionLog[]> {
    if (limit <= 0 || limit > 1000) {
      throw new Error('Limit must be between 1 and 1000');
    }

    // This would require a new backend endpoint, for now we'll get all POCs and their logs
    const pocs = await this.getAll();
    const allLogs: ExecutionLog[] = [];

    // Get logs for each POC (limited to avoid too many requests)
    const recentPocs = pocs.slice(0, 20); // Limit to 20 most recent POCs
    
    for (const poc of recentPocs) {
      try {
        const logs = await this.getLogs(poc.id, 5); // Get 5 most recent logs per POC
        allLogs.push(...logs);
      } catch (error) {
        console.warn(`Failed to get logs for POC ${poc.id}:`, error);
      }
    }

    // Sort by execution time and limit
    return allLogs
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get POC execution statistics
   */
  public async getExecutionStatistics(pocId?: string): Promise<{
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    averageExecutionTime?: number;
  }> {
    let logs: ExecutionLog[];

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
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Create a POC upload form data helper
   */
  public createUploadFormData(pocData: {
    script: File;
    cveId: string;
    name: string;
    description: string;
    language: string;
    usageExamples?: string;
    author?: string;
  }): FormData {
    const formData = new FormData();
    
    formData.append('script', pocData.script);
    formData.append('cveId', pocData.cveId);
    formData.append('name', pocData.name);
    formData.append('description', pocData.description);
    formData.append('language', pocData.language);
    
    if (pocData.usageExamples) {
      formData.append('usageExamples', pocData.usageExamples);
    }
    if (pocData.author) {
      formData.append('author', pocData.author);
    }

    return formData;
  }

  /**
   * Validate execute request data
   */
  private validateExecuteRequest(request: ExecuteRequest): void {
    if (!request.targetUrl || typeof request.targetUrl !== 'string') {
      throw new Error('Target URL is required and must be a string');
    }

    if (!request.command || typeof request.command !== 'string') {
      throw new Error('Command is required and must be a string');
    }

    // Basic URL validation
    try {
      new URL(request.targetUrl);
    } catch {
      throw new Error('Invalid target URL format');
    }

    // Command validation (basic security check)
    const dangerousPatterns = [
      /rm\s+-rf/i,
      /sudo/i,
      /passwd/i,
      /shutdown/i,
      /reboot/i,
      /format/i,
      /del\s+\/[sq]/i,
    ];

    if (dangerousPatterns.some(pattern => pattern.test(request.command))) {
      throw new Error('Command contains potentially dangerous operations');
    }
  }
}

// Export singleton instance
export const pocService = new POCServiceImpl();