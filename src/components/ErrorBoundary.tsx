import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4 p-6">
            <Icon name="AlertTriangle" size={48} className="mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Что-то пошло не так</h2>
            <p className="text-muted-foreground">Попробуйте перезагрузить страницу</p>
            <Button onClick={() => window.location.reload()}>Обновить страницу</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
