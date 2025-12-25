import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'

export default function Help() {
    return (
                    <DashboardShell>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            Help & Support
                        </CardTitle>
                        <CardDescription>Documentation and support resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                            <HelpCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Documentation coming soon</p>
                            <p className="text-sm">Help resources and guides will be available here</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardShell>    )
}
