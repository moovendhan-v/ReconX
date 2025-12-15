import * as React from 'react'
import { cn } from '@/lib/utils'
import { usePerformanceMonitor } from '@/hooks/use-performance-monitor'
import { PerformanceMonitor } from '@/components/performance/performance-monitor'

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const { startRender, endRender } = usePerformanceMonitor('DashboardShell')

  React.useEffect(() => {
    startRender()
    return () => endRender()
  })

  return (
    <>
      <main 
        id="main-content"
        className={cn('flex flex-col gap-8 p-6', className)}
        role="main"
        aria-label="Dashboard content"
      >
        {children}
      </main>
      <PerformanceMonitor />
    </>
  )
}