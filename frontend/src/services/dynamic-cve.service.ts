// Dynamic CVE API Service
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export interface CVEInput {
    name: string;
    type: 'TEXT' | 'LIST' | 'BOOLEAN' | 'AUTO_DISCOVER' | 'FILE';
    required: boolean;
    default?: any;
    description?: string;
    options?: string[];
    auto_detect?: boolean;
}

export interface DynamicCVE {
    cve_id: string;
    name: string;
    category: string;
    severity: string;
    cvss: number;
    description?: string;
    inputs: CVEInput[];
}

export interface CVEExecutionRequest {
    target: string;
    inputs: Record<string, any>;
}

export interface CVEExecutionResult {
    execution_id: string;
    cve_id: string;
    target: string;
    total_vectors: number;
    vulnerabilities_found: number;
    vulnerable: boolean;
    results: any[];
}

export interface DiscoveredParams {
    cve_id: string;
    target: string;
    discovered: {
        query: string[];
        body: string[];
        headers: string[];
        cookies: string[];
        paths: string[];
    };
}

class DynamicCVEService {
    private client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    async listCVEs(): Promise<{ total: number; cves: DynamicCVE[] }> {
        const response = await this.client.get('/cves/list');
        return response.data;
    }

    async getCVEDetails(cveId: string): Promise<DynamicCVE> {
        const response = await this.client.get(`/cves/${cveId}`);
        return response.data;
    }

    async executeCVE(
        cveId: string,
        request: CVEExecutionRequest
    ): Promise<CVEExecutionResult> {
        const response = await this.client.post(
            `/cves/${cveId}/execute`,
            request
        );
        return response.data;
    }

    async discoverParameters(
        cveId: string,
        target: string
    ): Promise<DiscoveredParams> {
        const response = await this.client.post(
            `/cves/${cveId}/discover`,
            null,
            { params: { target } }
        );
        return response.data;
    }

    async getExecutionStatus(executionId: string): Promise<any> {
        const response = await this.client.get(`/executions/${executionId}`);
        return response.data;
    }
}

export const dynamicCVEService = new DynamicCVEService();
