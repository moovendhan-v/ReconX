import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricsOverview } from '@/components/dashboard/analytics/metrics-overview'
import { SeverityChart } from '@/components/dashboard/analytics/severity-chart'
import { TrendChart } from '@/components/dashboard/analytics/trend-chart'
import { ExecutionStats } from '@/components/dashboard/analytics/execution-stats'
import { RecentActivity } from '@/components/dashboard/analytics/recent-activity'
import { useAnalytics, useTrendData, useExecutionStats } from '@/hooks/use-analytics'
import { RefreshCw, Download, Calendar, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState(30)
  
  const { 
    metrics, 
    severityDistribution, 
    recentActivity, 
    loading: mainLoading, 
    error: mainError, 
    refreshData,
    lastUpdated 
  } = useAnalytics()

  const { 
    trendData, 
    loading: trendLoading, 
    error: trendError
  } = useTrendData(selectedTimeRange, true)

  const { 
    stats: executionStats, 
    recentExecutions, 
    loading: executionLoading, 
    error: executionError
  } = useExecutionStats()

  const handleTimeRangeChange = (days: number) => {
    setSelectedTimeRange(days)
  }

  const handleExportData = () => {
    // Implement data export functionality
    console.log('Export analytics data')
  }

  const hasError = mainError || trendError || executionError
  const isLoading = mainLoading || trendLoading || executionLoading

  if (hasError && !metrics) {
    return (
              <DashboardShell>
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-muted-foreground">Failed to load analytics data</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {mainError || trendError || executionError}
                </p>
                <Button onClick={refreshData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </DashboardShell>    )
  }

  return (
          <DashboardShell>
        {/* Header with controls */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Comprehensive analytics and reporting for your reconnaissance activities
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button onClick={handleExportData} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={refreshData} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time Range
            </CardTitle>
            <CardDescription>
              Select the time period for trend analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[7, 14, 30, 60, 90].map((days) => (
                <Button
                  key={days}
                  variant={selectedTimeRange === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeRangeChange(days)}
                >
                  {days} days
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {severityDistribution && (
                <SeverityChart data={severityDistribution} />
              )}
              
              {trendData.length > 0 && (
                <TrendChart 
                  data={trendData}
                  title={`${selectedTimeRange}-Day Activity Overview`}
                  description="High-level activity trends"
                />
              )}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {trendData.length > 0 ? (
              <div className="grid gap-6">
                <TrendChart 
                  data={trendData}
                  title={`Detailed ${selectedTimeRange}-Day Trends`}
                  description="Comprehensive activity analysis over time"
                />
                
                {/* Additional trend metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">CVE Growth Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">+12.5%</div>
                      <p className="text-xs text-muted-foreground">vs previous period</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">POC Upload Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">+8.3%</div>
                      <p className="text-xs text-muted-foreground">vs previous period</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Execution Volume</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">+15.2%</div>
                      <p className="text-xs text-muted-foreground">vs previous period</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No trend data available for the selected period</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions" className="space-y-6">
            {executionStats && recentExecutions ? (
              <ExecutionStats 
                stats={executionStats}
                recentExecutions={recentExecutions}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">No execution data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <RecentActivity activities={recentActivity} maxItems={50} />
          </TabsContent>
        </Tabs>

        {/* Loading State */}
        {isLoading && !metrics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DashboardShell>  )
}