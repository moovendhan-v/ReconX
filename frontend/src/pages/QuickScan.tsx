import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Zap } from 'lucide-react'

export default function QuickScan() {
    return (
                    <DashboardShell>
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Quick Scan
                            </CardTitle>
                            <CardDescription>
                                Quickly scan a target for known vulnerabilities
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="target">Target URL or IP</Label>
                                <Input id="target" placeholder="https://example.com or 192.168.1.1" />
                            </div>
                            <Button className="w-full">
                                <Zap className="mr-2 h-4 w-4" />
                                Start Quick Scan
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </DashboardShell>    )
}
