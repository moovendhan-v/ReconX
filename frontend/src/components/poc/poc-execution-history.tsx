import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  Clock,
  Target,
  Terminal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import type { ExecutionLog } from '@/types'

interface POCExecutionHistoryProps {
  logs: ExecutionLog[]
  isLoading?: boolean
  onViewDetails?: (log: ExecutionLog) => void
  onDownloadLog?: (log: ExecutionLog) => void
  className?: string
}

type StatusFilter = 'all' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RUNNING'
type SortField = 'executedAt' | 'status' | 'targetUrl'
type SortOrder = 'asc' | 'desc'

export function POCExecutionHistory({ 
  logs, 
  isLoading = false, 
  onViewDetails, 
  onDownloadLog, 
  className 
}: POCExecutionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortField, setSortField] = useState<SortField>('executedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.targetUrl?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.command?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.output?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'executedAt':
          aValue = new Date(a.executedAt).getTime()
          bValue = new Date(b.executedAt).getTime()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'targetUrl':
          aValue = a.targetUrl || ''
          bValue = b.targetUrl || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [logs, searchQuery, statusFilter, sortField, sortOrder])

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'TIMEOUT':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'RUNNING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Terminal className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return 'default'
      case 'FAILED':
        return 'destructive'
      case 'TIMEOUT':
        return 'secondary'
      case 'RUNNING':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatDuration = (startTime: string) => {
    // This is a simplified duration calculation
    // In a real implementation, you'd have start and end times
    const now = new Date().getTime()
    const start = new Date(startTime).getTime()
    const diff = now - start
    
    if (diff < 1000) return '< 1s'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    return `${Math.floor(diff / 3600000)}h`
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const downloadAllLogs = () => {
    const logText = filteredAndSortedLogs.map(log => {
      const timestamp = new Date(log.executedAt).toLocaleString()
      const status = log.status
      const command = log.command || 'N/A'
      const output = log.output || 'No output'
      
      return `[${timestamp}] Status: ${status}
Command: ${command}
Target: ${log.targetUrl || 'N/A'}
Output:
${output}
${'='.repeat(80)}`
    }).join('\n\n')

    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poc-execution-history-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Execution History
            </CardTitle>
            <CardDescription>
              View and manage POC execution history and results
            </CardDescription>
          </div>
          
          <Button variant="outline" onClick={downloadAllLogs} disabled={logs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by target URL, command, or output..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="TIMEOUT">Timeout</SelectItem>
                <SelectItem value="RUNNING">Running</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-2xl font-bold">{logs.length}</div>
            <div className="text-sm text-muted-foreground">Total Executions</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(log => log.status === 'SUCCESS').length}
            </div>
            <div className="text-sm text-muted-foreground">Successful</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(log => log.status === 'FAILED').length}
            </div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter(log => log.status === 'RUNNING').length}
            </div>
            <div className="text-sm text-muted-foreground">Running</div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading execution history...
            </div>
          ) : filteredAndSortedLogs.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No execution history found</p>
                {searchQuery || statusFilter !== 'all' ? (
                  <p className="text-sm">Try adjusting your filters</p>
                ) : (
                  <p className="text-sm">Execute a POC to see history here</p>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('executedAt')}
                  >
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Executed At {getSortIcon('executedAt')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('targetUrl')}
                  >
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Target {getSortIcon('targetUrl')}
                    </div>
                  </TableHead>
                  <TableHead>Command</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge variant={getStatusBadgeVariant(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(log.executedAt).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate" title={log.targetUrl || 'N/A'}>
                        {log.targetUrl || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-64 truncate font-mono text-sm" title={log.command || 'N/A'}>
                        {log.command || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(log.executedAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onDownloadLog && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDownloadLog(log)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}