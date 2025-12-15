import { useState, useEffect, useCallback } from 'react'
import { analyticsService } from '../services/analytics.service'
import type {
  DashboardMetrics,
  TrendDataPoint,
  ExecutionStats,
  ActivityItem,
  SeverityDistribution,
  RecentExecution
} from '../services/analytics.service'

interface AnalyticsData {
  metrics: DashboardMetrics | null
  severityDistribution: SeverityDistribution | null
  trendData: TrendDataPoint[]
  executionStats: ExecutionStats | null
  recentActivity: ActivityItem[]
  recentExecutions: RecentExecution[]
}

interface AnalyticsState extends AnalyticsData {
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useAnalytics(options: {
  autoRefresh?: boolean
  refreshInterval?: number
  trendDays?: number
} = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    trendDays = 30
  } = options

  const [state, setState] = useState<AnalyticsState>({
    metrics: null,
    severityDistribution: null,
    trendData: [],
    executionStats: null,
    recentActivity: [],
    recentExecutions: [],
    loading: true,
    error: null,
    lastUpdated: null,
  })

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const [
        metrics,
        severityDistribution,
        trendData,
        executionStats,
        recentActivity,
        recentExecutions
      ] = await Promise.all([
        analyticsService.getDashboardMetrics(),
        analyticsService.getSeverityDistribution(),
        analyticsService.getTrendData(trendDays),
        analyticsService.getExecutionStats(),
        analyticsService.getRecentActivity(20),
        analyticsService.getRecentExecutions(10)
      ])

      setState({
        metrics,
        severityDistribution,
        trendData,
        executionStats,
        recentActivity,
        recentExecutions,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      })
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics data',
      }))
    }
  }, [trendDays])

  const refreshData = useCallback(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAnalyticsData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchAnalyticsData])

  // Real-time updates subscription
  useEffect(() => {
    if (!autoRefresh) return

    const unsubscribe = analyticsService.subscribeToUpdates((update) => {
      if (update.type === 'metrics') {
        setState(prev => ({
          ...prev,
          metrics: update.data,
          lastUpdated: new Date(),
        }))
      }
    })

    return unsubscribe
  }, [autoRefresh])

  return {
    ...state,
    refreshData,
    isStale: state.lastUpdated ? 
      Date.now() - state.lastUpdated.getTime() > refreshInterval * 2 : 
      false,
  }
}

// Hook for specific metrics only (lighter weight)
export function useDashboardMetrics(autoRefresh = true) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsService.getDashboardMetrics()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchMetrics, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh, fetchMetrics])

  return { metrics, loading, error, refresh: fetchMetrics }
}

// Hook for trend data with customizable time range
export function useTrendData(days = 30, autoRefresh = false) {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrendData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsService.getTrendData(days)
      setTrendData(data)
    } catch (error) {
      console.error('Failed to fetch trend data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch trend data')
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    fetchTrendData()
  }, [fetchTrendData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchTrendData, 60000) // 1 minute
    return () => clearInterval(interval)
  }, [autoRefresh, fetchTrendData])

  return { trendData, loading, error, refresh: fetchTrendData }
}

// Hook for execution statistics
export function useExecutionStats(autoRefresh = true) {
  const [stats, setStats] = useState<ExecutionStats | null>(null)
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [statsData, executionsData] = await Promise.all([
        analyticsService.getExecutionStats(),
        analyticsService.getRecentExecutions(10)
      ])
      setStats(statsData)
      setRecentExecutions(executionsData)
    } catch (error) {
      console.error('Failed to fetch execution stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch execution stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, 15000) // 15 seconds
    return () => clearInterval(interval)
  }, [autoRefresh, fetchData])

  return { stats, recentExecutions, loading, error, refresh: fetchData }
}