import { useState, useEffect } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Search,
  Filter,
  FileText,
  Play,
  History,
  Terminal,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { POCExecutionForm, POCTerminal, POCExecutionHistory } from '@/components/poc'
import { graphqlPocService as pocService } from '@/services/graphql/poc.service'
import type { POC, ExecutionLog, ExecuteRequest, ExecuteResponse, POCFilters } from '@/types'

export default function POCs() {
  const [pocs, setPocs] = useState<POC[]>([])
  const [selectedPoc, setSelectedPoc] = useState<POC | null>(null)
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState<string>('all')

  // Load POCs on component mount
  useEffect(() => {
    loadPocs()
  }, [])

  // Load execution logs when a POC is selected
  useEffect(() => {
    if (selectedPoc) {
      loadExecutionLogs(selectedPoc.id)
    }
  }, [selectedPoc])

  const loadPocs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const filters: POCFilters = {}
      if (languageFilter !== 'all') {
        filters.language = languageFilter
      }
      const data = await pocService.getAll(filters)
      setPocs(data.pocs)
    } catch (err: any) {
      setError(err.message || 'Failed to load POCs')
    } finally {
      setIsLoading(false)
    }
  }

  const loadExecutionLogs = async (pocId: string) => {
    try {
      const logs = await pocService.getLogs(pocId, 100)
      setExecutionLogs(logs)
    } catch (err: any) {
      console.error('Failed to load execution logs:', err)
    }
  }

  const handleExecutePoc = async (request: ExecuteRequest): Promise<ExecuteResponse> => {
    if (!selectedPoc) {
      throw new Error('No POC selected')
    }

    setIsExecuting(true)
    try {
      const result = await pocService.execute(selectedPoc.id, request)

      // Refresh execution logs after successful execution
      await loadExecutionLogs(selectedPoc.id)

      return result
    } finally {
      setIsExecuting(false)
    }
  }

  const handleViewLogDetails = (log: ExecutionLog) => {
    // In a real implementation, this could open a modal with detailed log view
    console.log('View log details:', log)
  }

  const handleDownloadLog = (log: ExecutionLog) => {
    const logText = `Execution Log - ${log.id}
Executed At: ${new Date(log.executedAt).toLocaleString()}
Status: ${log.status}
Target URL: ${log.targetUrl || 'N/A'}
Command: ${log.command || 'N/A'}

Output:
${log.output || 'No output'}
`

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `execution-log-${log.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredPocs = pocs.filter(poc => {
    const matchesSearch = !searchQuery ||
      poc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poc.cveId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLanguage = languageFilter === 'all' || poc.language === languageFilter

    return matchesSearch && matchesLanguage
  })

  const uniqueLanguages = Array.from(new Set(pocs.map(poc => poc.language)))

  const getSeverityColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'bash':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'ruby':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
          <DashboardShell>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* POC List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Available POCs
                    </CardTitle>
                    <CardDescription>
                      Select a POC to execute or view details
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadPocs} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search POCs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={languageFilter} onValueChange={setLanguageFilter}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {uniqueLanguages.map(language => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* POC List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading POCs...
                    </div>
                  ) : filteredPocs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No POCs found</p>
                      {searchQuery || languageFilter !== 'all' ? (
                        <p className="text-sm">Try adjusting your filters</p>
                      ) : (
                        <p className="text-sm">Upload POCs to get started</p>
                      )}
                    </div>
                  ) : (
                    filteredPocs.map((poc) => (
                      <div
                        key={poc.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedPoc?.id === poc.id ? 'border-primary bg-primary/5' : ''
                          }`}
                        onClick={() => setSelectedPoc(poc)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{poc.name}</h4>
                            <Badge className={getSeverityColor(poc.language)} variant="outline">
                              {poc.language}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {poc.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {poc.cveId}
                            </Badge>
                            {poc.author && (
                              <span className="text-xs text-muted-foreground">
                                by {poc.author}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* POC Details and Execution */}
          <div className="lg:col-span-2">
            {selectedPoc ? (
              <Tabs defaultValue="execute" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="execute" className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Execute
                  </TabsTrigger>
                  <TabsTrigger value="terminal" className="flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Terminal
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="execute">
                  <POCExecutionForm
                    poc={selectedPoc}
                    onExecute={handleExecutePoc}
                    isExecuting={isExecuting}
                  />
                </TabsContent>

                <TabsContent value="terminal">
                  <POCTerminal
                    logs={executionLogs}
                    isExecuting={isExecuting}
                    title={`${selectedPoc.name} - Execution Terminal`}
                  />
                </TabsContent>

                <TabsContent value="history">
                  <POCExecutionHistory
                    logs={executionLogs}
                    onViewDetails={handleViewLogDetails}
                    onDownloadLog={handleDownloadLog}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a POC to Execute</h3>
                    <p className="text-sm">
                      Choose a Proof of Concept from the list to view details and execute it
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardShell>  )
}