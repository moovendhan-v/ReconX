import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useScans } from '@/hooks/use-scans-graphql';
import { useScanSocket, ScanSocketEvent } from '@/hooks/use-scan-socket';
import { ScanJobCard } from '@/components/scans/ScanJobCard';
import { NewScanDialog } from '@/components/scans/NewScanDialog';
import { toast } from 'sonner';

export default function Scans() {
    const { scans, loading, refetch } = useScans({ limit: 50 });
    const { connected, on, off } = useScanSocket();
    const navigate = useNavigate();
    const [liveScans, setLiveScans] = useState<typeof scans>([]);

    // Initialize live scans from query
    useEffect(() => {
        if (scans.length > 0) {
            setLiveScans(scans);
        }
    }, [scans]);

    // Handle real-time updates from Socket.IO
    useEffect(() => {
        const handleScanUpdate = (event: ScanSocketEvent) => {
            console.log('Scan update received:', event);

            // Socket.IO updates are handled by polling fallback
            // No need to manually refetch - reduces redundant requests

            // Show toast notifications for significant events
            if (event.data) {
                switch (event.type) {
                    case 'scan:created':
                        toast.info(`New scan started for ${event.data.target}`);
                        break;
                    case 'scan:completed':
                        toast.success(`Scan completed for scan #${event.scanId.slice(0, 8)}`);
                        break;
                    case 'scan:failed':
                        toast.error(`Scan failed: ${event.data.error}`);
                        break;
                }
            }
        };

        // Subscribe to all scan events
        on('scan:update', handleScanUpdate);
        on('scan:created', handleScanUpdate);
        on('scan:started', handleScanUpdate);
        on('scan:progress', handleScanUpdate);
        on('scan:completed', handleScanUpdate);
        on('scan:failed', handleScanUpdate);

        return () => {
            off('scan:update', handleScanUpdate);
            off('scan:created', handleScanUpdate);
            off('scan:started', handleScanUpdate);
            off('scan:progress', handleScanUpdate);
            off('scan:completed', handleScanUpdate);
            off('scan:failed', handleScanUpdate);
        };
    }, [on, off]); // Removed refetch from dependencies since we no longer call it

    const handleScanClick = (scanId: string) => {
        navigate(`/scans/${scanId}`);
    };

    return (
        <DashboardShell>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight">Scan Jobs</h2>
                        {connected ? (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                <Wifi className="h-3 w-3 text-green-400" />
                                <span className="text-xs text-green-400 font-medium">Live</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-500/20 border border-gray-500/30">
                                <WifiOff className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-400 font-medium">Offline</span>
                            </div>
                        )}
                    </div>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage vulnerability scan jobs
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <NewScanDialog />
                </div>
            </div>

            {/* Scans Grid */}
            {loading && liveScans.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : liveScans.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                    <div className="text-muted-foreground">
                        <p className="text-lg font-medium mb-2">No scans yet</p>
                        <p className="text-sm mb-4">Start your first scan to detect vulnerabilities</p>
                        <NewScanDialog />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {liveScans.map((scan) => (
                        <ScanJobCard
                            key={scan.id}
                            scan={scan}
                            onClick={() => handleScanClick(scan.id)}
                        />
                    ))}
                </div>
            )}
        </DashboardShell>
    );
}
