/**
 * Типизированные хуки Redux.
 *
 * Обычные useDispatch/useSelector теряют типы экшенов и состояния: опечатка в имени
 * поля или неверный payload всплывёт в рантайме. Эти обёртки ловят такие ошибки
 * на компиляции — поэтому в коде проекта используются только они.
 */
import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './types'

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
