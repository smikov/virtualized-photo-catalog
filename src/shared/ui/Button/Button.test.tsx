/**
 * Проверяем UI-примитивы.
 *
 * Почему так: у кнопки нет бизнес-поведения, но есть контракт — вариант оформления
 * должен попадать в класс, а внешний className не должен теряться. Тест фиксирует
 * именно это и заодно покрывает все ветви выбора классов, иначе порог веток падает.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden'

describe('Button', () => {
  // Проверяем: по умолчанию кнопка не отправляет форму и получает основное оформление
  it('renders a non-submitting button by default', () => {
    render(<Button>Готово</Button>)

    const button = screen.getByRole('button', { name: 'Готово' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button.className).not.toBe('')
  })

  // Проверяем: каждый вариант и крупный размер дают свои классы, внешний класс сохраняется
  it('applies variant, size and external classes', () => {
    render(
      <>
        <Button variant="danger">Опасно</Button>
        <Button variant="secondary" size="lg" className="custom">
          Второй план
        </Button>
      </>
    )

    const danger = screen.getByRole('button', { name: 'Опасно' })
    const secondary = screen.getByRole('button', { name: 'Второй план' })

    expect(danger.className).not.toBe(secondary.className)
    expect(secondary.className).toContain('custom')
  })

  // Проверяем: клик доходит до обработчика, а явный type="submit" не перезаписывается
  it('forwards clicks and an explicit type', () => {
    const onClick = vi.fn()
    render(
      <Button type="submit" onClick={onClick}>
        Отправить
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Отправить' })
    fireEvent.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(button).toHaveAttribute('type', 'submit')
  })
})

describe('VisuallyHidden', () => {
  // Проверяем: скрытый текст остаётся в дереве доступности и называет связанный элемент
  it('keeps its text available to assistive technology', () => {
    render(
      <>
        <label htmlFor="field">
          <VisuallyHidden>Поиск</VisuallyHidden>
        </label>
        <input id="field" />
      </>
    )

    expect(screen.getByLabelText('Поиск')).toBeInTheDocument()
  })
})
