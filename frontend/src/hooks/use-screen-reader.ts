import { useEffect, useRef } from 'react'

interface ScreenReaderOptions {
  politeness?: 'polite' | 'assertive'
  atomic?: boolean
}

export function useScreenReader() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div')
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.style.position = 'absolute'
      liveRegion.style.left = '-10000px'
      liveRegion.style.width = '1px'
      liveRegion.style.height = '1px'
      liveRegion.style.overflow = 'hidden'
      document.body.appendChild(liveRegion)
      liveRegionRef.current = liveRegion
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current)
      }
    }
  }, [])

  const announce = (message: string, options: ScreenReaderOptions = {}) => {
    const { politeness = 'polite', atomic = true } = options

    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', politeness)
      liveRegionRef.current.setAttribute('aria-atomic', atomic.toString())
      liveRegionRef.current.textContent = message

      // Clear after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = ''
        }
      }, 1000)
    }
  }

  return { announce }
}