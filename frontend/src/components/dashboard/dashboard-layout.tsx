import * as React from 'react'
import { DashboardSidebar } from './sidebar'
import { Header } from './header'
import { MobileNav } from './mobile-nav'

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
      <div className="flex-1 overflow-auto bg-background">
        {/* Mobile Header with Navigation */}
        <div className="flex h-14 items-center border-b bg-card px-4 md:hidden">
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