import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { POCCreationForm } from '@/components/poc'

export default function CreatePOC() {
    return (
                    <DashboardShell>
                <div className="max-w-2xl mx-auto">
                    <POCCreationForm />
                </div>
            </DashboardShell>    )
}
