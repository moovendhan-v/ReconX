import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useScreenReader } from '@/hooks/use-screen-reader'
import { generateAriaLabel } from '@/lib/accessibility'

export function DashboardSidebar() {
  const location = useLocation()
  const [activeRoute, setActiveRoute] = useState(location.pathname)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const { announce } = useScreenReader()

  // Update active route when pathname changes
  useEffect(() => {
    setActiveRoute(location.pathname)
  }, [location.pathname])

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

  // Combine all routes for keyboard navigation
  const allRoutes = [...mainRoutes, ...analyticsRoutes, ...settingsRoutes]

  // Keyboard navigation
  useKeyboardNavigation({
    onArrowDown: () => {
      setFocusedIndex((prev) => (prev + 1) % allRoutes.length)
    },
    onArrowUp: () => {
      setFocusedIndex((prev) => (prev - 1 + allRoutes.length) % allRoutes.length)
    },
    onEnter: () => {
      if (focusedIndex >= 0 && focusedIndex < allRoutes.length) {
        const route = allRoutes[focusedIndex]
        announce(`Navigating to ${route.title}`)
      }
    },
  })

  return (
    <nav 
      className="flex h-screen w-64 flex-col bg-card border-r border-border shadow-lg"
      role="navigation"
      aria-label="Main navigation"
      id="navigation"
    >
      <div className="flex h-14 items-center border-b border-border px-4 bg-gradient-to-r from-card to-muted/20">
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
            {mainRoutes.map((route) => (
              <Button
                key={route.href}
                variant="ghost"
                asChild
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group animate-fade-in justify-start h-auto',
                  activeRoute === route.href || activeRoute.startsWith(`${route.href}/`)
                    ? 'bg-accent text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )}
              >
                <Link to={route.href}>
                  <route.icon
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      activeRoute === route.href || activeRoute.startsWith(`${route.href}/`) ? 'text-primary' : '',
                    )}
                  />
                  {route.title}
                </Link>
              </Button>
            ))}
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group animate-fade-in justify-start h-auto',
                  activeRoute === route.href || activeRoute.startsWith(`${route.href}/`)
                    ? 'bg-accent text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )}
              >
                <Link to={route.href}>
                  <route.icon
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      activeRoute === route.href || activeRoute.startsWith(`${route.href}/`) ? 'text-primary' : '',
                    )}
                  />
                  {route.title}
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group animate-fade-in justify-start h-auto',
                  activeRoute === route.href || activeRoute.startsWith(`${route.href}/`)
                    ? 'bg-accent text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                )}
              >
                <Link to={route.href}>
                  <route.icon
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      activeRoute === route.href || activeRoute.startsWith(`${route.href}/`) ? 'text-primary' : '',
                    )}
                  />
                  {route.title}
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
}