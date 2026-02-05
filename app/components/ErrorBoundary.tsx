/**
 * Error Boundary Component
 * ========================
 * Catches React errors and displays a fallback UI
 */

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic Error Boundary
 * Wraps components and catches errors in their tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetError);
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '12px', fontWeight: 700 }}>
              Something went wrong
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              We encountered an error while rendering this component.
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <>
                  <br />
                  <br />
                  <strong style={{ color: '#f87171' }}>Error:</strong>{' '}
                  {this.state.error.message}
                </>
              )}
            </p>
            <button
              onClick={this.resetError}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                border: 'none',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Page-level Error Boundary with custom styling
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, resetError) => (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom, #0a0a0a, #1a1a2e)',
          }}
        >
          <div
            style={{
              background: 'rgba(30, 30, 46, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '24px',
              padding: '48px',
              maxWidth: '600px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎬</div>
            <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '16px', fontWeight: 700 }}>
              Oops! Something Went Wrong
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', marginBottom: '32px', lineHeight: 1.6 }}>
              We're sorry, but we encountered an error while loading this page.
              Please try refreshing or go back to the homepage.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={resetError}
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
