import { useState, useEffect, useCallback } from 'react';
import { useCVEStatistics } from './use-cve-graphql';

interface Metrics {
  totalCVEs: number;
  criticalCVEs: number;
  totalPOCs: number;
  successfulExecutions: number;
}

interface SeverityDistribution {
  severity: string;
  count: number;
}

interface TrendDataPoint {
  date: string;
  cves: number;
  pocs: number;
  executions: number;
}

interface ActivityItem {
  id: string;
  type: 'cve' | 'poc' | 'execution';
  title: string;
  description: string;
  timestamp: string;
  severity?: string;
}

export function useAnalyticsGraphQL() {
  const { data: statisticsData, loading: statisticsLoading, error: statisticsError, refetch } = useCVEStatistics();
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [severityDistribution, setSeverityDistribution] = useState<SeverityDistribution[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use GraphQL statistics data if available
      if (statisticsData?.cveStatistics) {
        const stats = statisticsData.cveStatistics;
        
        const analyticsMetrics: Metrics = {
          totalCVEs: stats.total,
          criticalCVEs: stats.bySeverity.CRITICAL,
          totalPOCs: 342, // This would come from a separate POC statistics query
          successfulExecutions: 1856, // This would come from execution logs statistics
        };

        const analyticsDistribution: SeverityDistribution[] = [
          { severity: 'CRITICAL', count: stats.bySeverity.CRITICAL },
          { severity: 'HIGH', count: stats.bySeverity.HIGH },
          { severity: 'MEDIUM', count: stats.bySeverity.MEDIUM },
          { severity: 'LOW', count: stats.bySeverity.LOW },
        ];

        setMetrics(analyticsMetrics);
        setSeverityDistribution(analyticsDistribution);
      }

      // Generate mock trend data (would be replaced with actual GraphQL query)
      const mockTrendData: TrendDataPoint[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toISOString().split('T')[0],
          cves: Math.floor(Math.random() * 20) + 5,
          pocs: Math.floor(Math.random() * 10) + 2,
          executions: Math.floor(Math.random() * 50) + 10,
        };
      });

      // Generate mock recent activity (would be replaced with actual GraphQL query)
      const mockRecentActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'cve',
          title: 'CVE-2023-1234',
          description: 'Critical vulnerability in Apache HTTP Server',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          severity: 'CRITICAL',
        },
        {
          id: '2',
          type: 'poc',
          title: 'Apache HTTP Server Exploit',
          description: 'New POC uploaded for CVE-2023-1234',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: '3',
          type: 'execution',
          title: 'POC Execution Completed',
          description: 'Successfully executed POC against target',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ];

      setTrendData(mockTrendData);
      setRecentActivity(mockRecentActivity);
      setLastUpdated(new Date());
      setIsStale(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [statisticsData]);

  const refreshData = useCallback(async () => {
    await refetch();
    fetchAnalytics();
  }, [refetch, fetchAnalytics]);

  useEffect(() => {
    if (statisticsData || statisticsError) {
      fetchAnalytics();
    }
  }, [statisticsData, statisticsError, fetchAnalytics]);

  useEffect(() => {
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      setIsStale(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    severityDistribution,
    trendData,
    recentActivity,
    loading: loading || statisticsLoading,
    error: error || (statisticsError ? statisticsError.message : null),
    refreshData,
    isStale,
    lastUpdated,
  };
}