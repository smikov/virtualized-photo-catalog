/**
 * Root application component.
 *
 * Composes the global ErrorBoundary and the PhotosPage.
 *
 * @returns {JSX.Element} The root component.
 */
import { PhotosPage } from '@/pages/photos-page'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import styles from './App.module.css'

export function App() {
  return (
    <ErrorBoundary>
      <div className={styles.root}>
        <PhotosPage />
      </div>
    </ErrorBoundary>
  )
}

export default App
