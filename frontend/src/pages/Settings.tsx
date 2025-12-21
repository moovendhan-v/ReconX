import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
    return (
        <DashboardLayout title="Settings" description="Configure application settings">
            <DashboardShell>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5" />
                            Application Settings
                        </CardTitle>
                        <CardDescription>Manage your preferences and configuration</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                            <SettingsIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Settings coming soon</p>
                            <p className="text-sm">Configuration options will be available here</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardShell>
        </DashboardLayout>
    )
}
