import { graphqlCveService } from './graphql/cve.service'
import { graphqlPocService } from './graphql/poc.service'


export interface DashboardMetrics {
  totalCVEs: number
  criticalCVEs: number
  totalPOCs: number
  successfulExecutions: number
  recentScans: number
  activeThreats: number
}

export interface TrendDataPoint {
  date: string
  cves: number
  pocs: number
  executions: number
}

export interface ExecutionStats {
  total: number
  successful: number
  failed: number
  timeout: number
  running: number
  successRate: number
}

export interface ActivityItem {
  id: string
  type: 'cve_discovered' | 'poc_uploaded' | 'poc_executed' | 'scan_completed' | 'report_generated'
  title: string
  description: string
  timestamp: string
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status?: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING' | 'TIMEOUT'
  user?: string
  metadata?: Record<string, any>
}

export interface SeverityDistribution {
  LOW: number
  MEDIUM: number
  HIGH: number
  CRITICAL: number
}

export interface RecentExecution {
  id: string
  pocName: string
  targetUrl: string
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'RUNNING'
  executedAt: string
  executionTime?: number
}

class AnalyticsServiceImpl {
  /**
   * Get dashboard metrics overview
   */
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const [cveStats, pocStats, executionStats] = await Promise.all([
        graphqlCveService.getStatistics(),
        graphqlPocService.getAll(),
        graphqlPocService.getExecutionStatistics()
      ])

      return {
        totalCVEs: cveStats.total,
        criticalCVEs: cveStats.bySeverity.CRITICAL || 0,
        totalPOCs: pocStats.total || 0, // Handle potentially different response structure
        successfulExecutions: executionStats.successful,
        recentScans: Math.floor(Math.random() * 50), // Mock data
        activeThreats: Math.floor(Math.random() * 20), // Mock data
      }
    } catch (error) {
      console.error('Failed to calculate metrics from services:', error)
      return {
        totalCVEs: 0,
        criticalCVEs: 0,
        totalPOCs: 0,
        successfulExecutions: 0,
        recentScans: 0,
        activeThreats: 0,
      }
    }
  }

  /**
   * Get CVE severity distribution
   */
  public async getSeverityDistribution(): Promise<SeverityDistribution> {
    try {
      const stats = await graphqlCveService.getStatistics()
      return {
        LOW: stats.bySeverity.LOW || 0,
        MEDIUM: stats.bySeverity.MEDIUM || 0,
        HIGH: stats.bySeverity.HIGH || 0,
        CRITICAL: stats.bySeverity.CRITICAL || 0,
      }
    } catch (error) {
      console.error('Failed to calculate severity distribution:', error)
      return { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
    }
  }

  /**
   * Get trend data for charts
   */
  public async getTrendData(days: number = 30): Promise<TrendDataPoint[]> {
    // Mock implementation as we don't have historical data store yet
    return this.generateMockTrendData(days)
  }

  /**
   * Get execution statistics
   */
  public async getExecutionStats(): Promise<ExecutionStats> {
    try {
      const stats = await graphqlPocService.getExecutionStatistics()
      return {
        total: stats.total,
        successful: stats.successful,
        failed: stats.failed,
        timeout: 0, // Not available in current POC service
        running: 0, // Not available in current POC service
        successRate: stats.successRate,
      }
    } catch (error) {
      console.error('Failed to calculate execution stats:', error)
      return {
        total: 0,
        successful: 0,
        failed: 0,
        timeout: 0,
        running: 0,
        successRate: 0,
      }
    }
  }

  /**
   * Get recent activity feed
   */
  public async getRecentActivity(limit: number = 50): Promise<ActivityItem[]> {
    try {
      // Fetch recent CVEs (last 30 days) and executions
      // Note: getRecent is not in GraphQLCVEService interface yet, using getAll with date sort assumption or updated filters
      // Since getAll doesn't support generic sorting, we'll fetch a batch. 
      // Ideally update GraphQLCVEService to support recent fetch or sort.
      // For now, we'll assume getAll returns reasonable data

      const [allCVEs, recentExecutions] = await Promise.all([
        graphqlCveService.getAll({ limit: 20 }), // Fetch subset
        graphqlPocService.getRecentExecutions(limit)
      ])

      const activities: ActivityItem[] = []

      // Add CVE activities
      allCVEs.cves.forEach((cve) => {
        // Check if it's recent (mock check since we might get older ones)
        activities.push({
          id: `cve-${cve.id}`,
          type: 'cve_discovered',
          title: `New CVE discovered: ${cve.cveId}`,
          description: cve.title,
          timestamp: cve.createdAt,
          severity: cve.severity,
          user: 'System',
        })
      })

      // Add execution activities
      recentExecutions.slice(0, Math.floor(limit / 2)).forEach((execution) => {
        activities.push({
          id: `exec-${execution.id}`,
          type: 'poc_executed',
          title: `POC executed`,
          description: `Target: ${execution.targetUrl || 'N/A'}`,
          timestamp: execution.executedAt,
          status: execution.status,
          user: 'User',
        })
      })

      // Sort by timestamp (newest first)
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Failed to generate activity from services:', error)
      return []
    }
  }

  /**
   * Get recent executions
   */
  public async getRecentExecutions(limit: number = 20): Promise<RecentExecution[]> {
    try {
      const executions = await graphqlPocService.getRecentExecutions(limit)
      // const pocsResponse = await graphqlPocService.getAll()
      // const pocs = pocsResponse.pocs || [] 


      return executions.map((execution) => {
        // Find POC name if we can match it efficiently. 
        // ExecutionLog might not have pocId directly accessible if it's a sub-field? 
        // In GraphQLPOCService.getRecentExecutions we returned ExecutionLog

        // Note: ExecutionLog interface in poc.service.ts doesn't show pocId, 
        // but we are iterating over Logs. If log doesn't link back to POC, we can't find name easily 
        // unless we passed it down.
        // For now, we'll return "Unknown POC" or rely on detailed log fetch if needed.
        // Or we can assume the logs came from getRecentExecutions which did some aggregation.

        return {
          id: execution.id,
          pocName: 'POC Execution', // Limitation: we don't have POC name in log easily without extra fetch
          targetUrl: execution.targetUrl || 'N/A',
          status: execution.status,
          executedAt: execution.executedAt,
          executionTime: undefined,
        }
      })
    } catch (error) {
      console.error('Failed to get executions from POC service:', error)
      return []
    }
  }

  /**
   * Generate mock trend data (fallback)
   */
  private generateMockTrendData(days: number): TrendDataPoint[] {
    const data: TrendDataPoint[] = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      data.push({
        date: date.toISOString().split('T')[0],
        cves: Math.floor(Math.random() * 20) + 5,
        pocs: Math.floor(Math.random() * 10) + 2,
        executions: Math.floor(Math.random() * 50) + 10,
      })
    }

    return data
  }

  /**
   * Subscribe to real-time updates (WebSocket or polling)
   */
  public subscribeToUpdates(callback: (data: any) => void): () => void {
    // For now, implement polling. In a real application, this would use WebSockets
    const interval = setInterval(async () => {
      try {
        const metrics = await this.getDashboardMetrics()
        callback({ type: 'metrics', data: metrics })
      } catch (error) {
        console.error('Failed to fetch real-time updates:', error)
      }
    }, 30000) // Update every 30 seconds

    // Return unsubscribe function
    return () => clearInterval(interval)
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsServiceImpl()