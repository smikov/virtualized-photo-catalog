/**
 * Проверяем доступность таблицы.
 *
 * Почему так: стили переопределяют display у элементов таблицы, из-за чего браузер
 * может потерять неявные роли. Ручные проверки фиксируют нужные роли, axe ловит
 * то, что мы не предусмотрели (контраст, подписи, вложенность).
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { PhotosTableWidget } from './PhotosTableWidget'
import { PhotosTableSkeleton } from '../PhotosTableSkeleton/PhotosTableSkeleton'
import { createPhotos } from '@/testing/fixtures'

describe('PhotosTableWidget: доступность', () => {
  // Проверяем: таблица, её группы, строки и ячейки имеют явные роли —
  // display: block/flex в стилях отменяет неявные
  it('exposes explicit table roles for assistive technology', () => {
    render(<PhotosTableWidget data={createPhotos(2)} searchQuery="" />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('rowgroup')).toHaveLength(2)
    expect(screen.getAllByRole('columnheader').length).toBeGreaterThan(0)
    expect(screen.getByRole('table')).toHaveAttribute('aria-rowcount')
  })

  // Проверяем: у таблицы есть доступная подпись, а не только визуальный заголовок
  it('has an accessible caption', () => {
    render(<PhotosTableWidget data={createPhotos(2)} searchQuery="" />)

    expect(screen.getByRole('table')).toHaveAccessibleName(/Таблица фотографий/)
  })

  // Проверяем: axe не находит нарушений доступности в таблице
  it('has no accessibility violations', async () => {
    const { container } = render(<PhotosTableWidget data={createPhotos(3)} searchQuery="" />)

    expect(await axe(container)).toHaveNoViolations()
  })

  // Проверяем: скелетон загрузки не ломает доступность и скрыт от скринридера
  it('keeps the skeleton hidden from assistive technology', async () => {
    const { container } = render(<PhotosTableSkeleton />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(await axe(container)).toHaveNoViolations()
  })
})
