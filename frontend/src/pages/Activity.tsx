import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LifeBuoy } from 'lucide-react'

export default function Activity() {
    return (
        <DashboardLayout title="Activity" description="View recent activity">
            <DashboardShell>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LifeBuoy className="h-5 w-5" />
                            Activity Log
                        </CardTitle>
                        <CardDescription>Recent actions and events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                            <LifeBuoy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No recent activity</p>
                            <p className="text-sm">Your actions will be logged here</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardShell>
        </DashboardLayout>
    )
}
