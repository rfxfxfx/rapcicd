import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Suppress console.error for missing IntersectionObserver etc. in jsdom
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('Home page', () => {
  it('renders the hero heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('renders the GitHub link', () => {
    render(<Home />)
    const link = screen.getByRole('link', { name: /view on github/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://github.com/rfxfxfx/rapcicd')
  })

  it('renders the features section', () => {
    render(<Home />)
    expect(screen.getByRole('region', { name: /features/i })).toBeInTheDocument()
  })
})
