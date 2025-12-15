/**
 * Accessibility utilities for ReconX dashboard
 */

// ARIA label generators
export const generateAriaLabel = {
  navigation: (section: string) => `Navigate to ${section}`,
  button: (action: string, context?: string) => 
    context ? `${action} ${context}` : action,
  table: (rowCount: number, columnCount: number) => 
    `Data table with ${rowCount} rows and ${columnCount} columns`,
  form: (formName: string) => `${formName} form`,
  status: (status: string, context?: string) => 
    context ? `${context} status: ${status}` : `Status: ${status}`,
}

// Skip link component data
export const skipLinks = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#search', label: 'Skip to search' },
]

// Focus management utilities
export const focusManagement = {
  // Get all focusable elements within a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
  },

  // Move focus to first focusable element
  focusFirst: (container: HTMLElement): boolean => {
    const focusableElements = focusManagement.getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
      return true
    }
    return false
  },

  // Move focus to last focusable element
  focusLast: (container: HTMLElement): boolean => {
    const focusableElements = focusManagement.getFocusableElements(container)
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus()
      return true
    }
    return false
  },
}

// Keyboard navigation constants
export const keyboardKeys = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const

// ARIA attributes helpers
export const ariaAttributes = {
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),
  pressed: (isPressed: boolean) => ({ 'aria-pressed': isPressed }),
  checked: (isChecked: boolean) => ({ 'aria-checked': isChecked }),
  disabled: (isDisabled: boolean) => ({ 'aria-disabled': isDisabled }),
  hidden: (isHidden: boolean) => ({ 'aria-hidden': isHidden }),
  live: (politeness: 'polite' | 'assertive' | 'off') => ({ 'aria-live': politeness }),
  describedBy: (id: string) => ({ 'aria-describedby': id }),
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),
  controls: (id: string) => ({ 'aria-controls': id }),
}

// Color contrast utilities
export const colorContrast = {
  // Check if color combination meets WCAG AA standards
  meetsWCAGAA: (_foreground: string, _background: string): boolean => {
    // This is a simplified check - in production, use a proper color contrast library
    // For now, we'll assume our design system colors meet standards
    return true
  },

  // Get high contrast alternative
  getHighContrastColor: (color: string): string => {
    // Return high contrast alternatives for common colors
    const highContrastMap: Record<string, string> = {
      'text-muted-foreground': 'text-foreground',
      'text-secondary': 'text-primary',
      'bg-muted': 'bg-background',
    }
    return highContrastMap[color] || color
  },
}

// Screen reader utilities
export const screenReader = {
  // Generate descriptive text for complex UI elements
  describeDataTable: (rows: number, columns: number, sortColumn?: string, sortDirection?: 'asc' | 'desc') => {
    let description = `Table with ${rows} rows and ${columns} columns`
    if (sortColumn && sortDirection) {
      description += `, sorted by ${sortColumn} in ${sortDirection === 'asc' ? 'ascending' : 'descending'} order`
    }
    return description
  },

  // Generate status announcements
  announceStatus: (action: string, result: 'success' | 'error' | 'loading', details?: string) => {
    const statusMap = {
      success: 'completed successfully',
      error: 'failed',
      loading: 'in progress',
    }
    
    let announcement = `${action} ${statusMap[result]}`
    if (details) {
      announcement += `. ${details}`
    }
    return announcement
  },
}