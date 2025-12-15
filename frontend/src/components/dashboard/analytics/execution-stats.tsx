import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface ExecutionStatsProps {
  stats: {
    total: number
    successful: number
    failed: number
    timeout: number
    running: number
    successRate: number
  }
  recentExecutions: Array<{
    id: string
    pocName: string
    targetUrl: string
    status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RUNNING'
    executedAt: string
    executionTime?: number
  }>
}

export function ExecutionStats({ stats, recentExecutions }: ExecutionStatsProps) {
  const chartData = [
    { name: 'Successful', count: stats.successful, fill: '#10b981' },
    { name: 'Failed', count: stats.failed, fill: '#ef4444' },
    { name: 'Timeout', count: stats.timeout, fill: '#f59e0b' },
    { name: 'Running', count: stats.running, fill: '#6366f1' },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'TIMEOUT':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'RUNNING':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      SUCCESS: 'default',
      FAILED: 'destructive',
      TIMEOUT: 'secondary',
      RUNNING: 'outline',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toLowerCase()}
      </Badge>
    )
  }

  const formatExecutionTime = (time?: number) => {
    if (!time) return 'N/A'
    if (time < 1000) return `${time}ms`
    return `${(time / 1000).toFixed(1)}s`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.count} executions
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Execution Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Overview</CardTitle>
          <CardDescription>
            POC execution statistics and success rates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Success Rate</span>
            <span className="text-2xl font-bold text-green-600">
              {stats.successRate.toFixed(1)}%
            </span>
          </div>
          
          <Progress value={stats.successRate} className="h-2" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Successful: {stats.successful}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Failed: {stats.failed}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Timeout: {stats.timeout}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Running: {stats.running}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Total Executions: <span className="font-medium">{stats.total}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Execution Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Distribution</CardTitle>
          <CardDescription>
            Breakdown of execution results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>
            Latest POC execution attempts and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExecutions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No recent executions found
              </p>
            ) : (
              recentExecutions.slice(0, 10).map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <p className="font-medium text-sm">{execution.pocName}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {execution.targetUrl}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{new Date(execution.executedAt).toLocaleDateString()}</p>
                      <p>{formatExecutionTime(execution.executionTime)}</p>
                    </div>
                    {getStatusBadge(execution.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}