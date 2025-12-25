import * as React from 'react'
import { DashboardSidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Header } from './header'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/10 relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

        {/* Mobile Header with Navigation */}
        <div className="flex h-14 items-center border-b bg-card/80 backdrop-blur-md px-4 md:hidden relative z-10">
          <MobileNav />
          <div className="flex items-center gap-2">
            {title && <h1 className="text-lg font-medium">{title}</h1>}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header title={title} description={description} />
        </div>

        {/* Page Content */}
        <div className="h-full">
          {children}
        </div>
      </div>
    </div>
  )
}