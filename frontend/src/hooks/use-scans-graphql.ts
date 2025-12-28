import { useQuery, useMutation } from '@apollo/client/react';
import { GET_SCANS, GET_SCAN, START_QUICK_SCAN } from '@/graphql/scans.graphql';

export interface SubdomainResult {
    subdomain: string;
    ip: string[];
    discovered_at: string;
}

export interface PortResult {
    subdomain: string;
    port: number;
    service: string;
    state: 'open' | 'closed' | 'filtered';
    discovered_at: string;
}

export interface Scan {
    id: string;
    name: string;
    target: string;
    type: 'QUICK' | 'FULL' | 'CUSTOM';
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    progress?: number;
    subdomains?: SubdomainResult[];
    openPorts?: PortResult[];
    error?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GetScansResponse {
    scans: {
        scans: Scan[];
        total: number;
    };
}

export interface GetScanResponse {
    scan: Scan;
}

export interface StartQuickScanResponse {
    startQuickScan: Scan;
}

export interface ScanFilters {
    search?: string;
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
}

export function useScans(filters?: ScanFilters) {
    const { data, loading, error, refetch } = useQuery<GetScansResponse>(GET_SCANS, {
        variables: { filters },
        pollInterval: 30000, // Poll every 30 seconds (Socket.IO provides real-time updates)
    });

    return {
        scans: (data?.scans?.scans || []) as Scan[],
        total: data?.scans?.total || 0,
        loading,
        error,
        refetch,
    };
}

export function useScan(id: string) {
    const { data, loading, error, refetch } = useQuery<GetScanResponse>(GET_SCAN, {
        variables: { id },
        skip: !id,
    });

    return {
        scan: data?.scan as Scan | null,
        loading,
        error,
        refetch,
    };
}

export function useStartQuickScan() {
    const [startQuickScan, { loading, error, data }] = useMutation<StartQuickScanResponse>(START_QUICK_SCAN);

    const start = async (target: string) => {
        const result = await startQuickScan({
            variables: { target },
        });
        return result.data?.startQuickScan as Scan;
    };

    return {
        startQuickScan: start,
        loading,
        error,
        data,
    };
}
