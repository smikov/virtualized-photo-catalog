import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { PhotosPage } from './PhotosPage'
import { fetchPhotoPage } from '@/entities/photo'
import { createPhoto } from '@/testing/fixtures'
import { renderWithStore } from '@/testing/renderWithStore'

vi.mock('@/entities/photo', { spy: true })

const mockedFetch = vi.mocked(fetchPhotoPage)

/**
 * Дымовой тест страницы целиком: компоненты + реальный стор.
 *
 * Почему так: остальные тесты проверяют части по отдельности и могут «договориться»
 * о контракте, которого нет в реальности. Здесь собирается рабочая комбинация
 * «стор + провайдер + страница», чтобы поймать рассогласование между слоями.
 * Сеть при этом мокается — тест не должен зависеть от доступности API.
 */
describe('PhotosPage', () => {
  it('renders search input and table after photos are loaded', async () => {
    mockedFetch.mockResolvedValue({
      photos: [createPhoto({ id: 1, title: 'accusamus beatae' })],
      totalCount: 1,
    })

    renderWithStore(<PhotosPage />)

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(await screen.findByText('Успешно загружено записей: 1')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Поиск по названию...')).toBeInTheDocument()
    })
    expect(screen.getByRole('table')).toBeInTheDocument()
  })
})
