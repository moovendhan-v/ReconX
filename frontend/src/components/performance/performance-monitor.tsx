import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface PerformanceData {
  fps: number
  memoryUsage: number
  loadTime: number
  renderTime: number
  bundleSize: number
}

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime

        // Get memory usage if available
        const memory = (performance as any).memory
        const memoryUsage = memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0

        // Get navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const loadTime = navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0

        setPerformanceData({
          fps,
          memoryUsage,
          loadTime,
          renderTime: Math.round(performance.now()),
          bundleSize: 0, // Would need to be calculated during build
        })
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    measureFPS()

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      cancelAnimationFrame(animationId)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!isVisible || !performanceData || process.env.NODE_ENV !== 'development') {
    return null
  }

  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'good'
    if (value >= thresholds.warning) return 'warning'
    return 'poor'
  }

  const fpsStatus = getPerformanceStatus(performanceData.fps, { good: 55, warning: 30 })
  const memoryStatus = getPerformanceStatus(100 - performanceData.memoryUsage, { good: 70, warning: 50 })

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Performance Monitor
            <Badge variant="outline" className="text-xs">
              DEV
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span>FPS</span>
                <Badge 
                  variant={fpsStatus === 'good' ? 'default' : fpsStatus === 'warning' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {performanceData.fps}
                </Badge>
              </div>
              <Progress 
                value={Math.min(performanceData.fps, 60)} 
                max={60} 
                className="h-1"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span>Memory</span>
                <Badge 
                  variant={memoryStatus === 'good' ? 'default' : memoryStatus === 'warning' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {performanceData.memoryUsage}MB
                </Badge>
              </div>
              <Progress 
                value={Math.min(performanceData.memoryUsage, 100)} 
                max={100} 
                className="h-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>Load Time: {performanceData.loadTime}ms</div>
            <div>Render Time: {performanceData.renderTime}ms</div>
          </div>
          
          <div className="text-xs text-muted-foreground border-t pt-2">
            Press Ctrl+Shift+P to toggle
          </div>
        </CardContent>
      </Card>
    </div>
  )
}