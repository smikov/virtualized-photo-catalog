/**
 * Рендер компонента внутри Redux Provider с тестовым стором.
 *
 * Возвращает стор вместе с результатом render, чтобы тест мог проверить и видимый
 * результат, и сигнал отмены.
 */
import type { ReactElement } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createTestStore, type TestStore } from './createTestStore'

export interface RenderWithStoreResult extends RenderResult {
  store: TestStore
}

export function renderWithStore(ui: ReactElement): RenderWithStoreResult {
  const store = createTestStore()

  const result = render(<Provider store={store}>{ui}</Provider>)
  return { ...result, store }
}
