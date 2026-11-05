import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'
import { reportError } from '@/shared/lib/errorReporter'

vi.mock('@/shared/lib/errorReporter', () => ({ reportError: vi.fn() }))

function Broken({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('boom')
  }
  return <p>всё хорошо</p>
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports the error to the reporter instead of logging directly', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Broken shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument()
    expect(reportError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ scope: 'ErrorBoundary' })
    )
  })

  it('resets the error state when the user retries', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { rerender } = render(
      <ErrorBoundary>
        <Broken shouldThrow={true} />
      </ErrorBoundary>
    )

    rerender(
      <ErrorBoundary>
        <Broken shouldThrow={false} />
      </ErrorBoundary>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать снова' }))

    expect(screen.getByText('всё хорошо')).toBeInTheDocument()
  })
})
