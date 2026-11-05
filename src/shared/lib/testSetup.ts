import '@testing-library/jest-dom/vitest'
import * as axeMatchers from 'vitest-axe/matchers'
import { expect } from 'vitest'

// Матчер toHaveNoViolations для проверок доступности
expect.extend(axeMatchers)
