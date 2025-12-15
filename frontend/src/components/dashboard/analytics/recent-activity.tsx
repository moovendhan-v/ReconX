import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Shield, 
  Terminal, 
  Upload, 
  Search, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'

interface ActivityItem {
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

interface RecentActivityProps {
  activities: ActivityItem[]
  maxItems?: number
}

export function RecentActivity({ activities, maxItems = 20 }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'cve_discovered':
        return <Shield className="h-4 w-4" />
      case 'poc_uploaded':
        return <Upload className="h-4 w-4" />
      case 'poc_executed':
        return <Terminal className="h-4 w-4" />
      case 'scan_completed':
        return <Search className="h-4 w-4" />
      case 'report_generated':
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string, severity?: string, status?: string) => {
    if (status === 'FAILED') return 'text-red-500'
    if (status === 'SUCCESS') return 'text-green-500'
    if (status === 'RUNNING') return 'text-blue-500'
    
    switch (type) {
      case 'cve_discovered':
        switch (severity) {
          case 'CRITICAL': return 'text-red-500'
          case 'HIGH': return 'text-orange-500'
          case 'MEDIUM': return 'text-yellow-500'
          case 'LOW': return 'text-green-500'
          default: return 'text-muted-foreground'
        }
      case 'poc_uploaded':
        return 'text-blue-500'
      case 'poc_executed':
        return 'text-purple-500'
      case 'scan_completed':
        return 'text-indigo-500'
      case 'report_generated':
        return 'text-emerald-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null
    
    const variants = {
      CRITICAL: 'destructive',
      HIGH: 'destructive',
      MEDIUM: 'secondary',
      LOW: 'outline',
    } as const

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'} className="text-xs">
        {severity.toLowerCase()}
      </Badge>
    )
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'FAILED':
        return <AlertTriangle className="h-3 w-3 text-red-500" />
      case 'RUNNING':
        return <Clock className="h-3 w-3 text-blue-500" />
      case 'TIMEOUT':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      default:
        return null
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getUserInitials = (user?: string) => {
    if (!user) return 'SY' // System
    return user.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const displayedActivities = activities.slice(0, maxItems)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest reconnaissance activities and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent activity found
            </p>
          ) : (
            displayedActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {/* Activity Icon */}
                <div className={`mt-1 ${getActivityColor(activity.type, activity.severity, activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm leading-tight">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                    </div>
                    
                    {/* Status and Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusIcon(activity.status)}
                      {getSeverityBadge(activity.severity)}
                    </div>
                  </div>

                  {/* Metadata and Timestamp */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(activity.user)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user || 'System'}
                      </span>
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {activities.length > maxItems && (
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Showing {maxItems} of {activities.length} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}