import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function Reports() {
    return (
                    <DashboardShell>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Security Reports
                        </CardTitle>
                        <CardDescription>View and download security assessment reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No reports generated yet</p>
                            <p className="text-sm">Reports will appear here after running scans</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardShell>    )
}
