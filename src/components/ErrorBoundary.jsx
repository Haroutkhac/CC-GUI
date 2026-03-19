import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%', height: '100%',
          background: '#1a1a2e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Press Start 2P", monospace',
          color: '#F8F8F0',
        }}>
          <div style={{
            background: '#383838', border: '4px solid #C04040',
            padding: '32px', maxWidth: '480px', textAlign: 'center',
            imageRendering: 'pixelated',
          }}>
            <div style={{ fontSize: '14px', color: '#C04040', marginBottom: '16px' }}>
              ! ERROR !
            </div>
            <div style={{ fontSize: '8px', lineHeight: '1.8', marginBottom: '24px' }}>
              Something crashed.
              <br />
              {this.state.error?.message || 'Unknown error'}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={this.handleRetry} style={{
                fontFamily: '"Press Start 2P", monospace', fontSize: '8px',
                background: '#F8F8F0', color: '#383838', border: '3px solid #383838',
                padding: '8px 16px', cursor: 'pointer',
              }}>
                RETRY
              </button>
              <button onClick={this.handleReload} style={{
                fontFamily: '"Press Start 2P", monospace', fontSize: '8px',
                background: '#C04040', color: '#F8F8F0', border: '3px solid #383838',
                padding: '8px 16px', cursor: 'pointer',
              }}>
                RELOAD
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
