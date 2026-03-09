'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

// Class component — React error boundaries must be class-based.
// Catches any render/lifecycle error inside the dashboard without
// taking down the entire admin layout.
export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[AdminDashboard Error]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#E8F7F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            ⚠️
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0A1F14' }}>
            Dashboard failed to load
          </div>
          <div
            style={{
              fontSize: 13,
              color: '#8CA898',
              maxWidth: 320,
              textAlign: 'center',
            }}
          >
            {this.state.message || 'An unexpected error occurred.'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            style={{
              marginTop: 8,
              padding: '8px 20px',
              background: '#0D6E4F',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
