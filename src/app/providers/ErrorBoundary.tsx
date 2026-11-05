import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '@/shared/lib/errorReporter'
import { Button } from '@/shared/ui'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Глобальный Error Boundary для перехвата необработанных ошибок рендеринга.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  /**
   * Сбрасывает состояние ошибки, позволяя приложению попытаться отрисоваться снова.
   */
  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, {
      scope: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <h1 className={styles.title}>Что-то пошло не так</h1>
          <p className={styles.description}>
            В приложении произошла непредвиденная ошибка. Пожалуйста, перезагрузите страницу.
          </p>
          {this.state.error && <pre className={styles.details}>{this.state.error.toString()}</pre>}
          <div className={styles.actions}>
            <Button variant="secondary" size="lg" onClick={this.handleRetry}>
              Попробовать снова
            </Button>
            <Button size="lg" onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
