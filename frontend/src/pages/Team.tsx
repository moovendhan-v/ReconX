import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function Team() {
    return (
        <DashboardLayout title="Team" description="Manage team members">
            <DashboardShell>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Team Management
                        </CardTitle>
                        <CardDescription>Manage team members and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Team management coming soon</p>
                            <p className="text-sm">Invite and manage team members here</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardShell>
        </DashboardLayout>
    )
}
