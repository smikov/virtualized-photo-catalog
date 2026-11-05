/**
 * Проверяем миниатюру: ссылку на оригинал, заглушку и скелетон загрузки.
 *
 * Почему так: три состояния картинки (грузится / загрузилась / сломалась) напрямую
 * видны пользователю, а браузерные события load/error в jsdom можно вызвать вручную —
 * значит, все ветки проверяются без сети.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Thumbnail } from './Thumbnail'

describe('Thumbnail', () => {
  // Проверяем: миниатюра открывает оригинал в новой вкладке отдельной ссылкой
  it('renders a link to the original image', () => {
    render(
      <Thumbnail
        src="https://example.com/150/1.jpg"
        originalUrl="https://example.com/600/1.jpg"
        alt="photo"
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/600/1.jpg')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  // Проверяем: пока картинка не загрузилась, на её месте виден шиммер-скелетон
  it('shows a shimmer placeholder until the image is loaded', () => {
    const { container } = render(
      <Thumbnail
        src="https://example.com/150/1.jpg"
        originalUrl="https://example.com/600/1.jpg"
        alt="photo"
      />
    )

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()

    fireEvent.load(screen.getByRole('img'))

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  // Проверяем: если картинка не загрузилась, ячейка не остаётся пустой — показывается заглушка
  it('shows a placeholder when the image fails to load', () => {
    render(<Thumbnail src="broken.jpg" originalUrl="https://example.com/600/1.jpg" alt="photo" />)

    fireEvent.error(screen.getByRole('img'))

    expect(screen.getByText('нет фото')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
