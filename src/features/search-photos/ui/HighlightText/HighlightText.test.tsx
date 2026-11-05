import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HighlightText } from './HighlightText'

/**
 * Проверяем подсветку поискового запроса.
 *
 * Почему так: компонент работает с регулярным выражением, собранным из пользовательского
 * ввода, поэтому главные риски — некорректная реакция на пустой запрос и падение на
 * спецсимволах вроде скобок. Оба случая проверяются на уровне разметки: важно, что
 * совпадение обёрнуто в <mark>, а не как именно это сделано внутри.
 */
describe('HighlightText', () => {
  // Проверяем: без запроса текст выводится как есть, без лишней разметки
  it('renders plain text when query is empty', () => {
    render(<HighlightText text="Hello World" query="" />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  // Проверяем: поиск не зависит от регистра — «world» находит «World» и оборачивает в <mark>
  it('highlights matching query case-insensitively', () => {
    render(<HighlightText text="Hello World" query="world" />)
    const mark = screen.getByText('World')
    expect(mark.tagName).toBe('MARK')
  })

  // Проверяем: спецсимволы регулярного выражения в запросе не ломают разбор строки
  it('escapes special regex characters in query safely', () => {
    render(<HighlightText text="Test (special) [chars]" query="(special)" />)
    const mark = screen.getByText('(special)')
    expect(mark.tagName).toBe('MARK')
  })
})
