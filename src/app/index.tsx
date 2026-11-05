/**
 * Точка входа приложения (composition root).
 *
 * Здесь собираются все «провода»: глобальные стили, демонстрационная задержка запросов,
 * провайдер стора и рендер. Всё, что касается настройки окружения, живёт тут, а не в
 * бизнес-логике — см. ADR 001 и ADR 017.
 */
import '@/app/styles/global.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { App } from '@/app/ui/App'
import { store } from '@/app/store'
import { installRequestDelay } from '@/shared/api'
import { env } from '@/shared/config/env'

// Только для демонстрации: искусственная пауза перед запросами, чтобы успеть увидеть
// прогресс и проверить отмену. При нуле ничего не подключается
installRequestDelay(env.VITE_API_ARTIFICIAL_DELAY_MS)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
