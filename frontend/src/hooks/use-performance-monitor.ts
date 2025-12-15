import { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  renderTime: number
  memoryUsage?: number
  componentMountTime: number
  lastUpdateTime: number
}

interface PerformanceMonitorOptions {
  enabled?: boolean
  logToConsole?: boolean
  threshold?: number // ms
}

export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const { enabled = process.env.NODE_ENV === 'development', logToConsole = true, threshold = 16 } = options
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const mountTimeRef = useRef<number>(0)
  const renderStartRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    mountTimeRef.current = performance.now()
    
    return () => {
      const mountTime = performance.now() - mountTimeRef.current
      if (logToConsole && mountTime > threshold) {
        console.warn(`Component ${componentName} took ${mountTime.toFixed(2)}ms to mount`)
      }
    }
  }, [componentName, enabled, logToConsole, threshold])

  const startRender = () => {
    if (!enabled) return
    renderStartRef.current = performance.now()
  }

  const endRender = () => {
    if (!enabled || renderStartRef.current === 0) return

    const renderTime = performance.now() - renderStartRef.current
    const componentMountTime = performance.now() - mountTimeRef.current

    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize

    const newMetrics: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      componentMountTime,
      lastUpdateTime: Date.now(),
    }

    setMetrics(newMetrics)

    if (logToConsole && renderTime > threshold) {
      console.warn(`Component ${componentName} render took ${renderTime.toFixed(2)}ms`, newMetrics)
    }

    renderStartRef.current = 0
  }

  const measureAsync = async <T>(operation: () => Promise<T>, operationName: string): Promise<T> => {
    if (!enabled) return operation()

    const start = performance.now()
    try {
      const result = await operation()
      const duration = performance.now() - start
      
      if (logToConsole && duration > threshold) {
        console.log(`${componentName} - ${operationName} took ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      if (logToConsole) {
        console.error(`${componentName} - ${operationName} failed after ${duration.toFixed(2)}ms`, error)
      }
      throw error
    }
  }

  return {
    metrics,
    startRender,
    endRender,
    measureAsync,
  }
}