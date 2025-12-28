import React, { useState, useEffect } from 'react';
import { Play, AlertTriangle, RefreshCw, Shield, FileText } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dynamicCVEService } from '@/services/dynamic-cve.service';
import { DynamicCVEInputRenderer } from '@/components/dynamic-cve-input-renderer';
import type { DynamicCVE } from '@/services/dynamic-cve.service';

const severityColors = {
    LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
    INFO_LEAK: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    RCE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function DynamicCVEList() {
    const [cves, setCVEs] = useState<DynamicCVE[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCVE, setSelectedCVE] = useState<DynamicCVE | null>(null);
    const [targetUrl, setTargetUrl] = useState('');
    const [cveInputs, setCveInputs] = useState<Record<string, unknown>>({});
    const [executing, setExecuting] = useState(false);
    const [discovering, setDiscovering] = useState(false);
    const [discoveredParams, setDiscoveredParams] = useState<unknown>(null);
    const [executionResult, setExecutionResult] = useState<unknown>(null);

    useEffect(() => {
        loadCVEs();
    }, []);

    const loadCVEs = async () => {
        try {
            setLoading(true);
            const data = await dynamicCVEService.listCVEs();
            setCVEs(data.cves);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCVE = (cve: DynamicCVE) => {
        setSelectedCVE(cve);
        setCveInputs({});
        setDiscoveredParams(null);
        setExecutionResult(null);
    };

    const handleInputChange = (name: string, value: unknown) => {
        setCveInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleDiscover = async (cveId: string) => {
        if (!targetUrl) {
            alert('Please enter a target URL first');
            return;
        }

        try {
            setDiscovering(true);
            const params = await dynamicCVEService.discoverParameters(cveId, targetUrl);
            setDiscoveredParams(params);
        } catch (err) {
            alert(`Discovery failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setDiscovering(false);
        }
    };

    const handleExecute = async () => {
        if (!selectedCVE) return;
        if (!targetUrl) {
            alert('Please enter a target URL');
            return;
        }

        try {
            setExecuting(true);
            setExecutionResult(null);

            const result = await dynamicCVEService.executeCVE(selectedCVE.cve_id, {
                target: targetUrl,
                inputs: cveInputs,
            });

            setExecutionResult(result);
        } catch (err) {
            alert(`Execution failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setExecuting(false);
        }
    };

    if (loading) {
        return (
            <DashboardShell>
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
            </DashboardShell>
        );
    }

    if (error) {
        return (
            <DashboardShell>
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Error loading CVEs: {error}</AlertDescription>
                </Alert>
                <Button onClick={loadCVEs} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </DashboardShell>
        );
    }

    return (
        <DashboardShell>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dynamic CVE Platform</h2>
                    <p className="text-muted-foreground">
                        YAML-driven vulnerability testing with {cves.length} CVEs
                    </p>
                </div>
                <Button onClick={loadCVEs} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CVE List */}
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available CVEs ({cves.length})</CardTitle>
                            <CardDescription>Select a CVE to execute</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                            {cves.map((cve) => (
                                <div
                                    key={cve.cve_id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${selectedCVE?.cve_id === cve.cve_id ? 'border-primary bg-primary/5' : ''
                                        }`}
                                    onClick={() => handleSelectCVE(cve)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-mono text-sm font-medium">{cve.cve_id}</span>
                                        <Badge className={severityColors[cve.severity as keyof typeof severityColors]}>
                                            {cve.severity}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-medium mb-1">{cve.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="secondary">{cve.category}</Badge>
                                        <span>CVSS: {cve.cvss}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Execution Panel */}
                <div className="lg:col-span-2">
                    {selectedCVE ? (
                        <Tabs defaultValue="execute" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="execute">Execute</TabsTrigger>
                                <TabsTrigger value="results">Results</TabsTrigger>
                            </TabsList>

                            <TabsContent value="execute" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{selectedCVE.name}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    {selectedCVE.description}
                                                </CardDescription>
                                            </div>
                                            <Badge className={severityColors[selectedCVE.severity as keyof typeof severityColors]}>
                                                <Shield className="w-3 h-3 mr-1" />
                                                {selectedCVE.severity}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Target URL */}
                                        <div className="space-y-2">
                                            <Label htmlFor="target-url">
                                                Target URL <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="target-url"
                                                type="url"
                                                placeholder="https://example.com"
                                                value={targetUrl}
                                                onChange={(e) => setTargetUrl(e.target.value)}
                                            />
                                        </div>

                                        {/* Dynamic Inputs */}
                                        <DynamicCVEInputRenderer
                                            inputs={selectedCVE.inputs}
                                            cveId={selectedCVE.cve_id}
                                            onInputChange={handleInputChange}
                                            onDiscover={handleDiscover}
                                            discovering={discovering}
                                            discoveredParams={discoveredParams}
                                        />

                                        {/* Execute Button */}
                                        <Button
                                            onClick={handleExecute}
                                            disabled={executing || !targetUrl}
                                            className="w-full"
                                            size="lg"
                                        >
                                            {executing ? (
                                                <React.Fragment>
                                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                    Executing...
                                                </React.Fragment>
                                            ) : (
                                                <React.Fragment>
                                                    <Play className="mr-2 h-4 w-4" />
                                                    Execute CVE
                                                </React.Fragment>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="results">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Execution Results</CardTitle>
                                        <CardDescription>Results for {selectedCVE.cve_id}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {executionResult ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="p-4 border rounded-lg">
                                                        <div className="text-2xl font-bold">{(executionResult as Record<string, unknown>).total_vectors as number}</div>
                                                        <div className="text-sm text-muted-foreground">Vectors Tested</div>
                                                    </div>
                                                    <div className="p-4 border rounded-lg">
                                                        <div className={`text-2xl font-bold ${(executionResult as Record<string, unknown>).vulnerable ? 'text-destructive' : 'text-green-400'}`}>
                                                            {(executionResult as Record<string, unknown>).vulnerabilities_found as number}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Vulnerabilities</div>
                                                    </div>
                                                    <div className="p-4 border rounded-lg">
                                                        <div className={`text-2xl font-bold ${(executionResult as Record<string, unknown>).vulnerable ? 'text-destructive' : 'text-green-400'}`}>
                                                            {(executionResult as Record<string, unknown>).vulnerable ? 'VULNERABLE' : 'CLEAN'}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">Status</div>
                                                    </div>
                                                </div>

                                                {((executionResult as Record<string, unknown>).results as unknown[])?.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium">Vulnerability Details</h4>
                                                        {((executionResult as Record<string, unknown>).results as { vector?: { payload?: string }; matched_pattern?: string }[]).map((vuln, i: number) => (
                                                            <Alert key={i} variant="destructive">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                <AlertDescription>
                                                                    <div className="font-mono text-sm">
                                                                        {vuln.vector?.payload || 'N/A'}
                                                                    </div>
                                                                    {vuln.matched_pattern && (
                                                                        <div className="text-xs mt-1">
                                                                            Matched: {vuln.matched_pattern}
                                                                        </div>
                                                                    )}
                                                                </AlertDescription>
                                                            </Alert>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-muted-foreground">
                                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                <p>No execution results yet</p>
                                                <p className="text-sm">Execute the CVE to see results here</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                                <Shield className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium">No CVE Selected</p>
                                <p className="text-sm">Select a CVE from the list to begin</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
