import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileCode, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Shield, 
  Calendar, 
  ExternalLink, 
  Copy,
  AlertTriangle,
  Info,
  Terminal,
  Download
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cveService, pocService } from '../services/api.service';
import type { CVE, POC, ExecutionLog } from '../types';

const severityColors = {
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusColors = {
  SUCCESS: 'text-green-600 bg-green-50 border-green-200',
  FAILED: 'text-red-600 bg-red-50 border-red-200',
  TIMEOUT: 'text-orange-600 bg-orange-50 border-orange-200',
  RUNNING: 'text-blue-600 bg-blue-50 border-blue-200',
};

export default function CVEDetail() {
  const { id } = useParams<{ id: string }>();
  const [cve, setCve] = useState<CVE & { pocs: POC[] } | null>(null);
  const [selectedPoc, setSelectedPoc] = useState<POC & { executionLogs: ExecutionLog[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');
  const [command, setCommand] = useState('');
  const [executionOutput, setExecutionOutput] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadCVE();
    }
  }, [id]);

  const loadCVE = async () => {
    try {
      setLoading(true);
      const data = await cveService.getById(id!);
      setCve(data as any);
    } catch (error) {
      console.error('Failed to load CVE:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPocDetails = async (pocId: string) => {
    try {
      const data = await pocService.getById(pocId);
      setSelectedPoc(data as any);
      
      // Set default command if available
      if (data.usageExamples) {
        const lines = data.usageExamples.split('\n');
        const cmdLine = lines.find(l => l.includes('-c'));
        if (cmdLine) {
          const match = cmdLine.match(/-c\s+"([^"]+)"/);
          if (match) setCommand(match[1]);
        }
      }
    } catch (error) {
      console.error('Failed to load POC:', error);
    }
  };

  const executePoc = async () => {
    if (!selectedPoc || !targetUrl) return;

    try {
      setExecuting(true);
      setExecutionOutput('Starting POC execution...\n');
      
      const result = await pocService.execute(selectedPoc.id, { targetUrl, command });
      
      setExecutionOutput(prev => prev + `\nExecution completed with status: ${result.log.status}\n`);
      if (result.result.output) {
        setExecutionOutput(prev => prev + `Output:\n${result.result.output}\n`);
      }
      if (result.result.error) {
        setExecutionOutput(prev => prev + `Error:\n${result.result.error}\n`);
      }
      
      await loadPocDetails(selectedPoc.id); // Reload to get new logs
    } catch (error) {
      console.error('Execution failed:', error);
      setExecutionOutput(prev => prev + `\nExecution failed: ${error}\n`);
    } finally {
      setExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout title="Loading CVE...">
        <DashboardShell>
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="ml-4 text-muted-foreground">Loading CVE details...</p>
          </div>
        </DashboardShell>
      </DashboardLayout>
    );
  }

  if (!cve) {
    return (
      <DashboardLayout title="CVE Not Found">
        <DashboardShell>
          <div className="text-center py-12">
            <p className="text-muted-foreground">CVE not found</p>
          </div>
        </DashboardShell>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={cve.cveId} description={cve.title}>
      <DashboardShell>
        {/* Back Navigation */}
        <Button variant="ghost" asChild className="w-fit mb-6">
          <Link to="/dashboard/cves">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to CVEs
          </Link>
        </Button>

        {/* CVE Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-3xl font-mono">{cve.cveId}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(cve.cveId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xl text-muted-foreground">{cve.title}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={severityColors[cve.severity]} variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  {cve.severity}
                </Badge>
                {cve.cvssScore && (
                  <Badge variant="secondary">
                    CVSS: {cve.cvssScore}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* CVE Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pocs">POCs ({cve.pocs.length})</TabsTrigger>
            <TabsTrigger value="execution" disabled={!selectedPoc}>
              Execution
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  CVE Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-muted-foreground mt-1">{cve.description}</p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Published Date</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {cve.publishedDate ? formatDate(cve.publishedDate) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Last Modified</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(cve.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {cve.affectedProducts && cve.affectedProducts.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">Affected Products</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cve.affectedProducts.map((product, index) => (
                          <Badge key={index} variant="outline">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {cve.references && cve.references.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium">References</Label>
                      <div className="space-y-2 mt-2">
                        {cve.references.map((ref, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            <a
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {ref}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* POCs Tab */}
          <TabsContent value="pocs" className="space-y-6">
            {cve.pocs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileCode className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No POCs Available</p>
                  <p className="text-sm text-muted-foreground">
                    No proof-of-concept exploits have been added for this CVE yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {cve.pocs.map((poc) => (
                  <Card
                    key={poc.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPoc?.id === poc.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      loadPocDetails(poc.id);
                      setActiveTab('execution');
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <FileCode className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h4 className="text-lg font-bold mb-1">{poc.name}</h4>
                            <p className="text-muted-foreground text-sm mb-3">{poc.description}</p>
                            <div className="flex items-center space-x-3 text-xs">
                              <Badge variant="secondary">{poc.language}</Badge>
                              {poc.author && (
                                <span className="text-muted-foreground">by {poc.author}</span>
                              )}
                              <span className="text-muted-foreground">
                                Updated {formatDate(poc.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Execute
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-6">
            {selectedPoc ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      Execute POC: {selectedPoc.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Only execute POCs against systems you own or have explicit permission to test.
                        Unauthorized testing may be illegal.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="targetUrl">Target URL *</Label>
                        <Input
                          id="targetUrl"
                          type="text"
                          value={targetUrl}
                          onChange={(e) => setTargetUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="command">Command</Label>
                        <Input
                          id="command"
                          type="text"
                          value={command}
                          onChange={(e) => setCommand(e.target.value)}
                          placeholder="whoami"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={executePoc}
                        disabled={executing || !targetUrl}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {executing ? 'Executing...' : 'Execute POC'}
                      </Button>
                      
                      {selectedPoc.usageExamples && (
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(selectedPoc.usageExamples || '')}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Usage
                        </Button>
                      )}
                    </div>

                    {executionOutput && (
                      <div>
                        <Label>Real-time Output</Label>
                        <Textarea
                          value={executionOutput}
                          readOnly
                          className="mt-1 font-mono text-sm min-h-[200px]"
                          placeholder="Execution output will appear here..."
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Execution History */}
                {selectedPoc.executionLogs && selectedPoc.executionLogs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Execution History
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export Logs
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPoc.executionLogs.map((log) => (
                          <Card key={log.id} className="border-l-4 border-l-muted">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  {log.status === 'SUCCESS' ? (
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                  ) : log.status === 'FAILED' ? (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                  ) : log.status === 'TIMEOUT' ? (
                                    <Clock className="w-5 h-5 text-orange-500" />
                                  ) : (
                                    <Terminal className="w-5 h-5 text-blue-500" />
                                  )}
                                  <Badge 
                                    variant="outline" 
                                    className={statusColors[log.status as keyof typeof statusColors]}
                                  >
                                    {log.status}
                                  </Badge>
                                  {log.targetUrl && (
                                    <Badge variant="secondary" className="font-mono text-xs">
                                      {log.targetUrl}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(log.executedAt)}
                                </span>
                              </div>
                              
                              {log.command && (
                                <div className="mb-2">
                                  <Label className="text-xs">Command:</Label>
                                  <code className="block text-sm bg-muted p-2 rounded mt-1">
                                    {log.command}
                                  </code>
                                </div>
                              )}
                              
                              {log.output && (
                                <div>
                                  <Label className="text-xs">Output:</Label>
                                  <pre className="text-sm bg-muted p-3 rounded mt-1 overflow-x-auto max-h-40">
                                    {log.output}
                                  </pre>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Terminal className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No POC Selected</p>
                  <p className="text-sm text-muted-foreground">
                    Select a POC from the POCs tab to execute it.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </DashboardLayout>
  );
}