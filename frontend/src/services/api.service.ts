import axios from 'axios';
import type { CVE, POC, ExecutionLog, ExecuteRequest, ExecuteResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cveService = {
  getAll: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get<{ cves: CVE[]; page: number; limit: number; total: number }>('/cves', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<CVE & { pocs: POC[] }>(`/cves/${id}`);
    return response.data;
  },

  create: async (data: Partial<CVE>) => {
    const response = await api.post<CVE>('/cves', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CVE>) => {
    const response = await api.put<CVE>(`/cves/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/cves/${id}`);
    return response.data;
  },
};

export const pocService = {
  getAll: async (cveId?: string) => {
    const response = await api.get<POC[]>('/pocs', { params: { cveId } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<POC & { executionLogs: ExecutionLog[] }>(`/pocs/${id}`);
    return response.data;
  },

  upload: async (formData: FormData) => {
    const response = await api.post<POC>('/pocs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  execute: async (id: string, data: ExecuteRequest) => {
    const response = await api.post<ExecuteResponse>(`/pocs/${id}/execute`, data);
    return response.data;
  },

  getLogs: async (id: string, limit?: number) => {
    const response = await api.get<ExecutionLog[]>(`/pocs/${id}/logs`, { params: { limit } });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/pocs/${id}`);
    return response.data;
  },
};

export default api;
