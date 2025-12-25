import { Outlet } from 'react-router-dom'
import { DashboardLayout } from './dashboard-layout'

/**
 * Persistent layout wrapper for all dashboard routes
 * This prevents the sidebar from re-rendering when navigating between pages
 */
export function DashboardLayoutWrapper() {
    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    )
}
