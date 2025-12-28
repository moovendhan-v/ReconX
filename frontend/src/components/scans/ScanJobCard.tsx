import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle2, XCircle, Loader2, Shield } from 'lucide-react';
import { Scan } from '@/hooks/use-scans-graphql';
import { formatDistanceToNow } from 'date-fns';

export interface ScanJobCardProps {
    scan: Scan;
    onClick?: () => void;
}

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

export function ScanJobCard({ scan, onClick }: ScanJobCardProps) {
    const StatusIcon = statusIcons[scan.status];
    const statusColor = statusColors[scan.status];
    const typeColor = typeColors[scan.type];

    const progress = scan.progress || 0;
    const subdomainCount = scan.subdomains?.length || 0;
    const portsCount = scan.openPorts?.length || 0;

    return (
        <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={onClick}
        >
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <Badge className={typeColor}>{scan.type}</Badge>
                    </div>
                    <Badge className={statusColor}>
                        <StatusIcon className={`w-3 h-3 mr-1 ${scan.status === 'RUNNING' ? 'animate-spin' : ''}`} />
                        {scan.status}
                    </Badge>
                </div>

                {/* Target */}
                <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-1">Target</div>
                    <div className="font-mono text-sm font-medium">{scan.target}</div>
                </div>

                {/* Progress Bar */}
                {scan.status === 'RUNNING' && (
                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <div className="text-2xl font-bold">{subdomainCount}</div>
                        <div className="text-xs text-muted-foreground">Subdomains</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{portsCount}</div>
                        <div className="text-xs text-muted-foreground">Open Ports</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${portsCount > 0 ? 'text-destructive' : 'text-green-400'}`}>
                            {portsCount > 0 ? 'AT RISK' : 'CLEAN'}
                        </div>
                        <div className="text-xs text-muted-foreground">Status</div>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {scan.completedAt
                            ? `Completed ${formatDistanceToNow(new Date(scan.completedAt))} ago`
                            : scan.startedAt
                                ? `Started ${formatDistanceToNow(new Date(scan.startedAt))} ago`
                                : `Created ${formatDistanceToNow(new Date(scan.createdAt))} ago`
                        }
                    </div>
                    <div className="font-mono text-xs opacity-50">
                        #{scan.id.slice(0, 8)}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
