import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  BarChart2,
  FileText,
  FolderClosed,
  Home,
  Menu,
  Search,
  Settings,
  Shield,
  Terminal,
  Users,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const routes = [
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
      href: '/dashboard/team',
      icon: Users,
      title: 'Team',
    },
    {
      href: '/dashboard/settings',
      icon: Settings,
      title: 'Settings',
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="flex items-center gap-2 pb-4">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-primary">ReconX</span>
        </div>
        
        <nav className="flex flex-col space-y-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === route.href || location.pathname.startsWith(`${route.href}/`)
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}