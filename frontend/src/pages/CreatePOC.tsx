import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { POCCreationForm } from '@/components/poc'

export default function CreatePOC() {
    return (
        <DashboardLayout title="Create POC" description="Register a new Proof of Concept">
            <DashboardShell>
                <div className="max-w-2xl mx-auto">
                    <POCCreationForm />
                </div>
            </DashboardShell>
        </DashboardLayout>
    )
}
