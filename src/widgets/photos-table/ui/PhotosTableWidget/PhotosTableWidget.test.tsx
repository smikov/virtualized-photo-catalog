import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PhotosTableWidget } from './PhotosTableWidget'
import { createPhoto } from '@/testing/fixtures'

const photos = [
  createPhoto({ id: 1, title: 'cats in the garden' }),
  createPhoto({ id: 2, title: 'dogs on the beach' }),
]

/**
 * Проверяем фильтрацию таблицы.
 *
 * Почему так: в jsdom виртуализатор не измеряет высоты и не рендерит строки, поэтому
 * проверять «видно ли строку» бессмысленно. Вместо этого проверяется результат
 * фильтрации — счётчик найденного и пустое состояние: именно они отражают, что данные
 * прошли через фильтр TanStack, а не отрисовались все подряд.
 */
describe('PhotosTableWidget', () => {
  // Проверяем: без запроса в таблицу попадают все строки
  it('shows every row when there is no search query', () => {
    render(<PhotosTableWidget data={photos} searchQuery="" />)

    expect(screen.getByText('Найдено записей: 2 из 2')).toBeInTheDocument()
  })

  // Проверяем: фильтрация по заголовку выполняется средствами TanStack Table
  it('filters rows by title through the table filter', () => {
    render(<PhotosTableWidget data={photos} searchQuery="DOGS" />)

    expect(screen.getByText('Найдено записей: 1 из 2')).toBeInTheDocument()
  })

  // Проверяем: при отсутствии совпадений показывается понятное пустое состояние
  it('renders empty state when nothing matches the query', () => {
    render(<PhotosTableWidget data={photos} searchQuery="unicorn" />)

    expect(screen.getByText('Ничего не найдено по запросу «unicorn»')).toBeInTheDocument()
  })
})
