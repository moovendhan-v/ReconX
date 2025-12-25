import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Play, Plus } from 'lucide-react'

export default function Scans() {
    return (
                    <DashboardShell>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Scan History</h1>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Scan
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Recent Scans
                        </CardTitle>
                        <CardDescription>View your recent vulnerability scans</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                            <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No scans yet</p>
                            <p className="text-sm">Start your first scan to detect vulnerabilities</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardShell>    )
}
