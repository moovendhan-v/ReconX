import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string
  }
  icon?: React.ComponentType<{ className?: string }>
}

export function MetricCard({ title, value, description, trend, icon: Icon }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400'
      case 'down':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(trend.value)}% from {trend.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricsOverviewProps {
  metrics: {
    totalCVEs: number
    criticalCVEs: number
    totalPOCs: number
    successfulExecutions: number
    recentScans: number
    activeThreats: number
  }
  trends?: {
    cves: { value: number; direction: 'up' | 'down' | 'neutral' }
    pocs: { value: number; direction: 'up' | 'down' | 'neutral' }
    executions: { value: number; direction: 'up' | 'down' | 'neutral' }
  }
}

export function MetricsOverview({ metrics, trends }: MetricsOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Total CVEs"
        value={metrics.totalCVEs.toLocaleString()}
        description="Vulnerabilities in database"
        trend={trends?.cves ? { ...trends.cves, period: 'last month' } : undefined}
      />
      
      <MetricCard
        title="Critical CVEs"
        value={metrics.criticalCVEs.toLocaleString()}
        description="High priority vulnerabilities"
      />
      
      <MetricCard
        title="Available POCs"
        value={metrics.totalPOCs.toLocaleString()}
        description="Proof of concept scripts"
        trend={trends?.pocs ? { ...trends.pocs, period: 'last month' } : undefined}
      />
      
      <MetricCard
        title="Successful Executions"
        value={metrics.successfulExecutions.toLocaleString()}
        description="POCs executed successfully"
        trend={trends?.executions ? { ...trends.executions, period: 'last week' } : undefined}
      />
      
      <MetricCard
        title="Recent Scans"
        value={metrics.recentScans.toLocaleString()}
        description="Scans in last 24 hours"
      />
      
      <MetricCard
        title="Active Threats"
        value={metrics.activeThreats.toLocaleString()}
        description="Currently monitored threats"
      />
    </div>
  )
}