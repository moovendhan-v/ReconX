import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Loader2, Shield, Wifi, WifiOff, Globe, Network } from 'lucide-react';
import { useScan } from '@/hooks/use-scans-graphql';
import { useScanSocket } from '@/hooks/use-scan-socket';
import { formatDistanceToNow } from 'date-fns';

const statusIcons = {
    PENDING: Clock,
    RUNNING: Loader2,
    COMPLETED: CheckCircle2,
    FAILED: XCircle,
};

const statusColors = {
    PENDING: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    RUNNING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeColors = {
    QUICK: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    FULL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    CUSTOM: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export default function ScanDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { scan, loading, refetch } = useScan(id || '');
    const { connected, joinScan, leaveScan } = useScanSocket();

    // Subscribe to real-time updates for this scan
    useEffect(() => {
        if (id) {
            joinScan(id);
            return () => leaveScan(id);
        }
    }, [id, joinScan, leaveScan]);

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardShell>
        );
    }

    if (!scan) {
        return (
            <DashboardShell>
                <div className="text-center py-12">
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                    <h2 className="text-2xl font-bold mb-2">Scan not found</h2>
                    <p className="text-muted-foreground mb-4">The scan you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate('/dashboard/scans')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Scans
                    </Button>
                </div>
            </DashboardShell>
        );
    }

    const StatusIcon = statusIcons[scan.status];
    const statusColor = statusColors[scan.status];
    const typeColor = typeColors[scan.type];
    const progress = scan.progress || 0;
    const subdomainCount = scan.subdomains?.length || 0;
    const portsCount = scan.openPorts?.length || 0;

    return (
        <DashboardShell>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/scans')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight">Scan Details</h2>
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
                        <p className="text-muted-foreground mt-1 font-mono text-sm">
                            Scan ID: {scan.id}
                        </p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Refresh
                </Button>
            </div>

            {/* Status Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Scan Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Target */}
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Target</div>
                            <div className="font-mono text-sm font-medium">{scan.target}</div>
                        </div>

                        {/* Type */}
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Scan Type</div>
                            <Badge className={typeColor}>{scan.type}</Badge>
                        </div>

                        {/* Status */}
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">Status</div>
                            <Badge className={statusColor}>
                                <StatusIcon className={`w-3 h-3 mr-1 ${scan.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                                {scan.status}
                            </Badge>
                        </div>

                        {/* Timestamp */}
                        <div>
                            <div className="text-xs text-muted-foreground mb-1">
                                {scan.completedAt ? 'Completed' : scan.startedAt ? 'Started' : 'Created'}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(scan.completedAt || scan.startedAt || scan.createdAt))} ago
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {scan.status === 'RUNNING' && (
                        <div className="mt-6">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>Progress</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}

                    {/* Error Message */}
                    {scan.status === 'FAILED' && scan.error && (
                        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-md">
                            <div className="flex items-start gap-2">
                                <XCircle className="w-4 h-4 text-destructive mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-destructive mb-1">Scan Failed</div>
                                    <div className="text-xs text-muted-foreground">{scan.error}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subdomains */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary" />
                                Subdomains
                            </div>
                            <Badge variant="secondary">{subdomainCount}</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {subdomainCount === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No subdomains discovered yet
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {scan.subdomains?.map((subdomain, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-md bg-secondary/30 border border-secondary"
                                    >
                                        <div className="font-mono text-sm font-medium mb-1">
                                            {subdomain.subdomain}
                                        </div>
                                        {subdomain.ip && subdomain.ip.length > 0 && (
                                            <div className="text-xs text-muted-foreground">
                                                IP: {subdomain.ip.join(', ')}
                                            </div>
                                        )}
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Discovered {formatDistanceToNow(new Date(subdomain.discovered_at))} ago
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Open Ports */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Network className="w-5 h-5 text-primary" />
                                Open Ports
                            </div>
                            <Badge variant="secondary" className={portsCount > 0 ? 'bg-destructive/20 text-destructive border-destructive/30' : ''}>
                                {portsCount}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {portsCount === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No open ports discovered yet
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {scan.openPorts?.map((port, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-md bg-destructive/10 border border-destructive/30"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-mono text-sm font-medium">
                                                {port.subdomain}
                                            </div>
                                            <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                                                {port.state.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Port {port.port} • {port.service}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Discovered {formatDistanceToNow(new Date(port.discovered_at))} ago
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardShell>
    );
}
