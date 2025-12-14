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
