import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table } from 'lucide-react'

export default function Processes() {
    return (
                    <DashboardShell>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Table className="h-5 w-5" />
                            Active Processes
                        </CardTitle>
                        <CardDescription>Monitor running scans and POC executions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground">
                            <Table className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No active processes</p>
                            <p className="text-sm">Active scans and executions will appear here</p>
                        </div>
                    </CardContent>
                </Card>
            </DashboardShell>    )
}
