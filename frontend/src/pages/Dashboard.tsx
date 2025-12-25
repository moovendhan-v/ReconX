import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MetricsOverview } from '@/components/dashboard/analytics/metrics-overview'
import { SeverityChart } from '@/components/dashboard/analytics/severity-chart'
import { TrendChart } from '@/components/dashboard/analytics/trend-chart'
import { RecentActivity } from '@/components/dashboard/analytics/recent-activity'
import { useAnalytics } from '@/hooks/use-analytics'
import { Shield, Terminal, Search, FileText, RefreshCw, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    metrics,
    severityDistribution,
    trendData,
    recentActivity,
    loading,
    error,
    refreshData,
    isStale,
    lastUpdated
  } = useAnalytics()

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'scan':
        // Navigate to scan page when implemented
        console.log('Navigate to scan page')
        break
      case 'poc':
        navigate('/pocs')
        break
      case 'report':
        // Navigate to reports page when implemented
        console.log('Navigate to reports page')
        break
      case 'cves':
        navigate('/cves')
        break
    }
  }

  if (error) {
    return (
      <DashboardShell>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-muted-foreground">Failed to load dashboard data</p>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Real-time reconnaissance metrics and activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStale && (
            <Badge variant="secondary" className="text-xs">
              Data may be outdated
            </Badge>
          )}
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={refreshData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <MetricsOverview
          metrics={metrics}
          trends={{
            cves: { value: 12.5, direction: 'up' },
            pocs: { value: 8.3, direction: 'up' },
            executions: { value: 15.2, direction: 'up' }
          }}
        />
      )}

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Severity Distribution */}
        {severityDistribution && (
          <SeverityChart data={severityDistribution} />
        )}

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <TrendChart
            data={trendData}
            title="30-Day Activity Trends"
            description="CVE discoveries, POC uploads, and execution activity"
          />
        )}
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activity */}
        <div className="md:col-span-2">
          <RecentActivity activities={recentActivity} maxItems={15} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickAction('scan')}
            >
              <Search className="h-4 w-4 mr-2" />
              Start New Scan
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickAction('poc')}
            >
              <Terminal className="h-4 w-4 mr-2" />
              Execute POC
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickAction('report')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickAction('cves')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Browse CVEs
            </Button>
          </CardContent>
        </Card>
      </div>


      {/* Content loads without skeleton */}
    </DashboardShell>
  )
}