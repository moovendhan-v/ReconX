import { Link, useLocation } from 'react-router-dom'
import { useMemo, memo } from 'react'
import {
  BarChart2,
  FileText,
  FolderClosed,
  HelpCircle,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Table,
  Terminal,
  Users,
  Zap,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { generateAriaLabel } from '@/lib/accessibility'

export const DashboardSidebar = memo(function DashboardSidebar() {
  const location = useLocation()

  // Memoize active route to prevent recalculations
  const activeRoute = useMemo(() => location.pathname, [location.pathname])


  const mainRoutes = [
    {
      href: '/dashboard',
      icon: Home,
      title: 'Dashboard',
    },
    {
      href: '/dashboard/cves',
      icon: Shield,
      title: 'CVEs',
    },
    {
      href: '/dashboard/pocs',
      icon: Terminal,
      title: 'POCs',
    },
    {
      href: '/dashboard/scans',
      icon: Search,
      title: 'Scans',
    },
    {
      href: '/dashboard/quick-scan',
      icon: Zap,
      title: 'Quick Scan',
    },
    {
      href: '/dashboard/reports',
      icon: FileText,
      title: 'Reports',
    },
    {
      href: '/dashboard/processes',
      icon: Table,
      title: 'Processes',
    },
  ]

  const analyticsRoutes = [
    {
      href: '/dashboard/analytics',
      icon: BarChart2,
      title: 'Analytics',
    },
    {
      href: '/dashboard/projects',
      icon: FolderClosed,
      title: 'Projects',
    },
    {
      href: '/dashboard/activity',
      icon: LifeBuoy,
      title: 'Activity',
    },
  ]

  const settingsRoutes = [
    {
      href: '/dashboard/settings',
      icon: Settings,
      title: 'Settings',
    },
    {
      href: '/dashboard/team',
      icon: Users,
      title: 'Team',
    },
    {
      href: '/dashboard/help',
      icon: HelpCircle,
      title: 'Help & Support',
    },
  ]

  return (
    <nav
      className="flex h-screen w-64 flex-col glass-panel backdrop-blur-xl bg-card/40 border-r border-border/50 shadow-2xl relative overflow-hidden"
      role="navigation"
      aria-label="Main navigation"
      id="navigation"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none" />

      <div className="flex h-14 items-center border-b border-border/50 px-4 bg-gradient-to-r from-card/50 to-transparent backdrop-blur-sm relative z-10">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 font-semibold group"
          aria-label={generateAriaLabel.navigation('dashboard home')}
        >
          <LayoutDashboard
            className="h-6 w-6 text-primary group-hover:scale-110 transition-transform"
            aria-hidden="true"
          />
          <span className="text-primary font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            ReconX Dashboard
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <div className="px-3 py-2">
          <Button
            asChild
            className="flex w-full items-center justify-between bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary hover:text-primary transition-all duration-200"
            variant="outline"
          >
            <Link to="/dashboard/pocs/new">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-medium">New POC</span>
              </div>
            </Link>
          </Button>
        </div>

        {/* Main Navigation */}
        <div className="px-2 py-2">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Main</h3>
          <nav className="grid gap-1">
            {mainRoutes.map((route) => {
              // Special handling for Dashboard - only exact match
              const isActive = route.href === '/dashboard'
                ? activeRoute === '/dashboard'
                : activeRoute === route.href || activeRoute.startsWith(`${route.href}/`);

              return (
                <Button
                  key={route.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 group animate-fade-in justify-start h-auto relative',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-md border-l-4 border-l-primary glow-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-l-2 hover:border-l-primary/50 hover:shadow-sm',
                  )}
                >
                  <Link to={route.href} className="flex items-center gap-3 w-full">
                    <route.icon
                      className={cn(
                        'h-4 w-4 transition-all group-hover:scale-125 group-hover:rotate-12',
                        isActive ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]' : '',
                      )}
                    />
                    <span className={cn(isActive && 'font-semibold')}>{route.title}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Analytics Navigation */}
        <div className="px-2 py-2">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Analytics</h3>
          <nav className="grid gap-1">
            {analyticsRoutes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                asChild
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 group animate-fade-in justify-start h-auto relative',
                  activeRoute === route.href || activeRoute.startsWith(`${route.href}/`)
                    ? 'bg-primary/10 text-primary shadow-md border-l-4 border-l-primary glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-l-2 hover:border-l-primary/50 hover:shadow-sm',
                )}
              >
                <Link to={route.href} className="flex items-center gap-3 w-full">
                  <route.icon
                    className={cn(
                      'h-4 w-4 transition-all group-hover:scale-125 group-hover:rotate-12',
                      activeRoute === route.href || activeRoute.startsWith(`${route.href}/`) ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]' : '',
                    )}
                  />
                  <span className={cn((activeRoute === route.href || activeRoute.startsWith(`${route.href}/`)) && 'font-semibold')}>{route.title}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* Settings Navigation */}
        <div className="px-2 py-2">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground tracking-wider">Settings</h3>
          <nav className="grid gap-1">
            {settingsRoutes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                asChild
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 group animate-fade-in justify-start h-auto relative',
                  activeRoute === route.href || activeRoute.startsWith(`${route.href}/`)
                    ? 'bg-primary/10 text-primary shadow-md border-l-4 border-l-primary glow-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:border-l-2 hover:border-l-primary/50 hover:shadow-sm',
                )}
              >
                <Link to={route.href} className="flex items-center gap-3 w-full">
                  <route.icon
                    className={cn(
                      'h-4 w-4 transition-all group-hover:scale-125 group-hover:rotate-12',
                      activeRoute === route.href || activeRoute.startsWith(`${route.href}/`) ? 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]' : '',
                    )}
                  />
                  <span className={cn((activeRoute === route.href || activeRoute.startsWith(`${route.href}/`)) && 'font-semibold')}>{route.title}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-auto border-t border-border p-4 bg-gradient-to-t from-muted/10 to-transparent">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/50 hover:bg-card transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
            RX
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">ReconX User</span>
            <span className="text-xs text-muted-foreground truncate">admin@reconx.local</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 hover:bg-muted/50">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
})