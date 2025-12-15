import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom'
import { SkipLinks } from '../skip-links'
import { FocusIndicator } from '../focus-indicator'
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation'
import { useScreenReader } from '@/hooks/use-screen-reader'
import { generateAriaLabel, focusManagement } from '@/lib/accessibility'

// Mock component for testing keyboard navigation
function TestKeyboardComponent() {
  const mockHandlers = {
    onEscape: vi.fn(),
    onEnter: vi.fn(),
    onArrowUp: vi.fn(),
    onArrowDown: vi.fn(),
  }

  useKeyboardNavigation(mockHandlers)

  return (
    <div data-testid="keyboard-test">
      <button>Test Button</button>
    </div>
  )
}

// Mock component for testing screen reader
function TestScreenReaderComponent() {
  const { announce } = useScreenReader()

  return (
    <div>
      <button onClick={() => announce('Test announcement')}>
        Announce
      </button>
    </div>
  )
}

describe('Accessibility Components', () => {
  describe('SkipLinks', () => {
    it('should render skip links with proper accessibility attributes', () => {
      render(<SkipLinks />)
      
      const skipToMain = screen.getByText('Skip to main content')
      const skipToNav = screen.getByText('Skip to navigation')
      const skipToSearch = screen.getByText('Skip to search')
      
      expect(skipToMain).toBeInTheDocument()
      expect(skipToNav).toBeInTheDocument()
      expect(skipToSearch).toBeInTheDocument()
      
      expect(skipToMain).toHaveAttribute('href', '#main-content')
      expect(skipToNav).toHaveAttribute('href', '#navigation')
      expect(skipToSearch).toHaveAttribute('href', '#search')
    })
  })

  describe('FocusIndicator', () => {
    it('should add keyboard-user class on Tab key press', () => {
      render(<FocusIndicator />)
      
      // Initially no keyboard-user class
      expect(document.body.classList.contains('keyboard-user')).toBe(false)
      
      // Simulate Tab key press
      fireEvent.keyDown(document, { key: 'Tab' })
      
      expect(document.body.classList.contains('keyboard-user')).toBe(true)
    })

    it('should remove keyboard-user class on mouse interaction', () => {
      render(<FocusIndicator />)
      
      // Add keyboard-user class first
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(document.body.classList.contains('keyboard-user')).toBe(true)
      
      // Simulate mouse interaction
      fireEvent.mouseDown(document)
      
      expect(document.body.classList.contains('keyboard-user')).toBe(false)
    })
  })

  describe('useKeyboardNavigation', () => {
    it('should call appropriate handlers for keyboard events', () => {
      const mockHandlers = {
        onEscape: vi.fn(),
        onEnter: vi.fn(),
        onArrowUp: vi.fn(),
        onArrowDown: vi.fn(),
      }

      function TestComponent() {
        useKeyboardNavigation(mockHandlers)
        return <div>Test</div>
      }

      render(<TestComponent />)

      // Test Escape key
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(mockHandlers.onEscape).toHaveBeenCalled()

      // Test Enter key
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(mockHandlers.onEnter).toHaveBeenCalled()

      // Test Arrow keys
      fireEvent.keyDown(document, { key: 'ArrowUp' })
      expect(mockHandlers.onArrowUp).toHaveBeenCalled()

      fireEvent.keyDown(document, { key: 'ArrowDown' })
      expect(mockHandlers.onArrowDown).toHaveBeenCalled()
    })
  })

  describe('useScreenReader', () => {
    it('should create live region for announcements', () => {
      render(<TestScreenReaderComponent />)
      
      // Check if live region is created
      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion).toBeTruthy()
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true')
    })

    it('should announce messages to screen readers', async () => {
      render(<TestScreenReaderComponent />)
      
      const announceButton = screen.getByText('Announce')
      fireEvent.click(announceButton)
      
      const liveRegion = document.querySelector('[aria-live="polite"]')
      expect(liveRegion?.textContent).toBe('Test announcement')
    })
  })

  describe('Accessibility Utilities', () => {
    describe('generateAriaLabel', () => {
      it('should generate proper ARIA labels', () => {
        expect(generateAriaLabel.navigation('dashboard')).toBe('Navigate to dashboard')
        expect(generateAriaLabel.button('Save')).toBe('Save')
        expect(generateAriaLabel.button('Save', 'document')).toBe('Save document')
        expect(generateAriaLabel.table(10, 5)).toBe('Data table with 10 rows and 5 columns')
      })
    })

    describe('focusManagement', () => {
      it('should find focusable elements', () => {
        const container = document.createElement('div')
        container.innerHTML = `
          <button>Button 1</button>
          <input type="text" />
          <a href="#">Link</a>
          <button disabled>Disabled Button</button>
          <div tabindex="0">Focusable Div</div>
        `
        
        const focusableElements = focusManagement.getFocusableElements(container)
        expect(focusableElements).toHaveLength(4) // Excludes disabled button
      })

      it('should focus first and last elements', () => {
        const container = document.createElement('div')
        container.innerHTML = `
          <button id="first">First</button>
          <button id="second">Second</button>
          <button id="last">Last</button>
        `
        document.body.appendChild(container)
        
        // Focus first element
        const focusedFirst = focusManagement.focusFirst(container)
        expect(focusedFirst).toBe(true)
        expect(document.activeElement?.id).toBe('first')
        
        // Focus last element
        const focusedLast = focusManagement.focusLast(container)
        expect(focusedLast).toBe(true)
        expect(document.activeElement?.id).toBe('last')
        
        document.body.removeChild(container)
      })
    })
  })
})