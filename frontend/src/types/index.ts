// Core domain types
export interface CVE {
  id: string;
  cveId: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cvssScore: string | null;
  publishedDate: string | null;
  affectedProducts: string[] | null;
  references: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface POC {
  id: string;
  cveId: string;
  name: string;
  description: string;
  language: string;
  scriptPath: string;
  usageExamples: string | null;
  author: string | null;
  createdAt: string;
  updatedAt: string;
  cve?: CVE;
  scriptContent?: string;
}

export interface ExecutionLog {
  id: string;
  pocId: string;
  targetUrl: string | null;
  command: string | null;
  output: string | null;
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RUNNING';
  executedAt: string;
}

// API Request/Response types
export interface ExecuteRequest {
  targetUrl: string;
  command: string;
  additionalParams?: Record<string, any>;
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

export interface CVEListResponse {
  cves: CVE[];
  page: number;
  limit: number;
  total: number;
}

export interface CVEDetailResponse extends CVE {
  pocs: POC[];
}

export interface POCDetailResponse extends POC {
  executionLogs: ExecutionLog[];
}

export interface CVEFilters {
  search?: string;
  page?: number;
  limit?: number;
  severity?: CVE['severity'];
  dateFrom?: string;
  dateTo?: string;
}

export interface POCFilters {
  cveId?: string;
  language?: string;
  author?: string;
}

// API Configuration types
export interface APIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Error types
export interface APIError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class APIException extends Error {
  public status?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message);
    this.name = 'APIException';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Service interfaces
export interface APIService {
  baseURL: string;
  request<T>(endpoint: string, options?: RequestOptions): Promise<T>;
}

export interface CVEService extends APIService {
  getAll(filters?: CVEFilters): Promise<CVEListResponse>;
  getById(id: string): Promise<CVEDetailResponse>;
  create(data: Partial<CVE>): Promise<CVE>;
  update(id: string, data: Partial<CVE>): Promise<CVE>;
  delete(id: string): Promise<{ message: string }>;
  search(query: string): Promise<CVE[]>;
}

export interface POCService extends APIService {
  getAll(filters?: POCFilters): Promise<POC[]>;
  getById(id: string): Promise<POCDetailResponse>;
  upload(formData: FormData): Promise<POC>;
  execute(id: string, request: ExecuteRequest): Promise<ExecuteResponse>;
  getLogs(id: string, limit?: number): Promise<ExecutionLog[]>;
  delete(id: string): Promise<{ message: string }>;
}
