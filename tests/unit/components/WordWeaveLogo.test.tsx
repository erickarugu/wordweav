import { render, screen } from '@testing-library/react'
import { WordWeaveLogo } from '@/components/WordWeaveLogo'

describe('WordWeaveLogo Component', () => {
  test('renders with default props', () => {
    render(<WordWeaveLogo />)
    
    const logo = screen.getByRole('img', { name: /wordweave logo/i })
    expect(logo).toBeInTheDocument()
  })

  test('renders compact version', () => {
    render(<WordWeaveLogo compact />)
    
    const logo = screen.getByRole('img', { name: /wordweave logo/i })
    expect(logo).toBeInTheDocument()
    
    // Should not show full text in compact mode
    expect(screen.queryByText('WordWeave')).not.toBeInTheDocument()
  })

  test('applies custom className', () => {
    const customClass = 'custom-logo-class'
    render(<WordWeaveLogo className={customClass} />)
    
    const logo = screen.getByRole('img', { name: /wordweave logo/i })
    expect(logo).toHaveClass(customClass)
  })

  test('has proper SVG structure for accessibility', () => {
    render(<WordWeaveLogo />)
    
    const svg = screen.getByRole('img', { name: /wordweave logo/i })
    expect(svg.tagName).toBe('svg')
    expect(svg).toHaveAttribute('aria-label', 'WordWeave Logo')
  })

  test('contains gradient definitions', () => {
    const { container } = render(<WordWeaveLogo />)
    
    // Should have gradient defs for the weaving pattern
    const defs = container.querySelector('defs')
    expect(defs).toBeInTheDocument()
    
    const gradients = container.querySelectorAll('linearGradient')
    expect(gradients.length).toBeGreaterThan(0)
  })

  test('has unique gradient IDs to avoid conflicts', () => {
    const { container: container1 } = render(<WordWeaveLogo />)
    const { container: container2 } = render(<WordWeaveLogo />)
    
    const gradients1 = Array.from(container1.querySelectorAll('linearGradient')).map(g => g.id)
    const gradients2 = Array.from(container2.querySelectorAll('linearGradient')).map(g => g.id)
    
    // Each instance should have different gradient IDs
    gradients1.forEach((id1, index) => {
      expect(id1).not.toBe(gradients2[index])
    })
  })

  test('shows text in full version', () => {
    render(<WordWeaveLogo />)
    
    // Should show WordWeave text in full version
    expect(screen.getByText('WordWeave')).toBeInTheDocument()
  })

  test('handles different sizes', () => {
    const { rerender } = render(<WordWeaveLogo className="w-8 h-8" />)
    
    let logo = screen.getByRole('img', { name: /wordweave logo/i })
    expect(logo).toHaveClass('w-8', 'h-8')
    
    rerender(<WordWeaveLogo className="w-16 h-16" />)
    
    logo = screen.getByRole('img', { name: /wordweave logo/i })
    expect(logo).toHaveClass('w-16', 'h-16')
  })

  test('has proper viewBox for scalability', () => {
    const { container } = render(<WordWeaveLogo />)
    
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox')
    
    const viewBox = svg?.getAttribute('viewBox')
    expect(viewBox).toMatch(/^\d+\s+\d+\s+\d+\s+\d+$/) // Should be "x y width height" format
  })

  test('includes weaving pattern paths', () => {
    const { container } = render(<WordWeaveLogo />)
    
    // Should have multiple path elements for the weaving pattern
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThan(2) // At least a few paths for the pattern
  })
})
