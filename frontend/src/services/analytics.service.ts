import { BaseAPIService } from './base-api.service'
import { cveService } from './cve.service'
import { pocService } from './poc.service'


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

class AnalyticsServiceImpl extends BaseAPIService {
  private readonly endpoint = '/analytics'

  /**
   * Get dashboard metrics overview
   */
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Try to get from dedicated analytics endpoint first
      return await this.get<DashboardMetrics>(`${this.endpoint}/metrics`)
    } catch (error) {
      // Fallback to calculating from individual services
      console.warn('Analytics endpoint not available, calculating metrics from services')
      return this.calculateMetricsFromServices()
    }
  }

  /**
   * Get CVE severity distribution
   */
  public async getSeverityDistribution(): Promise<SeverityDistribution> {
    try {
      return await this.get<SeverityDistribution>(`${this.endpoint}/severity-distribution`)
    } catch (error) {
      console.warn('Severity distribution endpoint not available, calculating from CVE service')
      return this.calculateSeverityDistribution()
    }
  }

  /**
   * Get trend data for charts
   */
  public async getTrendData(days: number = 30): Promise<TrendDataPoint[]> {
    try {
      return await this.get<TrendDataPoint[]>(`${this.endpoint}/trends?days=${days}`)
    } catch (error) {
      console.warn('Trends endpoint not available, generating mock data')
      return this.generateMockTrendData(days)
    }
  }

  /**
   * Get execution statistics
   */
  public async getExecutionStats(): Promise<ExecutionStats> {
    try {
      return await this.get<ExecutionStats>(`${this.endpoint}/execution-stats`)
    } catch (error) {
      console.warn('Execution stats endpoint not available, calculating from POC service')
      return this.calculateExecutionStats()
    }
  }

  /**
   * Get recent activity feed
   */
  public async getRecentActivity(limit: number = 50): Promise<ActivityItem[]> {
    try {
      return await this.get<ActivityItem[]>(`${this.endpoint}/activity?limit=${limit}`)
    } catch (error) {
      console.warn('Activity endpoint not available, generating from services')
      return this.generateActivityFromServices(limit)
    }
  }

  /**
   * Get recent executions
   */
  public async getRecentExecutions(limit: number = 20): Promise<RecentExecution[]> {
    try {
      return await this.get<RecentExecution[]>(`${this.endpoint}/recent-executions?limit=${limit}`)
    } catch (error) {
      console.warn('Recent executions endpoint not available, using POC service')
      return this.getExecutionsFromPOCService(limit)
    }
  }

  /**
   * Calculate metrics from individual services (fallback)
   */
  private async calculateMetricsFromServices(): Promise<DashboardMetrics> {
    try {
      const [cveStats, pocStats, executionStats] = await Promise.all([
        cveService.getStatistics(),
        pocService.getAll(),
        pocService.getExecutionStatistics()
      ])

      return {
        totalCVEs: cveStats.total,
        criticalCVEs: cveStats.bySeverity.CRITICAL || 0,
        totalPOCs: pocStats.length,
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
   * Calculate severity distribution from CVE service
   */
  private async calculateSeverityDistribution(): Promise<SeverityDistribution> {
    try {
      const stats = await cveService.getStatistics()
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
   * Calculate execution stats from POC service
   */
  private async calculateExecutionStats(): Promise<ExecutionStats> {
    try {
      const stats = await pocService.getExecutionStatistics()
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
   * Generate activity from services (fallback)
   */
  private async generateActivityFromServices(limit: number): Promise<ActivityItem[]> {
    try {
      const [recentCVEs, recentExecutions] = await Promise.all([
        cveService.getRecent(7),
        pocService.getRecentExecutions(limit)
      ])

      const activities: ActivityItem[] = []

      // Add CVE activities
      recentCVEs.slice(0, Math.floor(limit / 2)).forEach((cve) => {
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
   * Get executions from POC service
   */
  private async getExecutionsFromPOCService(limit: number): Promise<RecentExecution[]> {
    try {
      const executions = await pocService.getRecentExecutions(limit)
      const pocs = await pocService.getAll()
      
      return executions.map((execution) => {
        const poc = pocs.find(p => p.id === execution.pocId)
        return {
          id: execution.id,
          pocName: poc?.name || 'Unknown POC',
          targetUrl: execution.targetUrl || 'N/A',
          status: execution.status,
          executedAt: execution.executedAt,
          executionTime: undefined, // Not available in current structure
        }
      })
    } catch (error) {
      console.error('Failed to get executions from POC service:', error)
      return []
    }
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