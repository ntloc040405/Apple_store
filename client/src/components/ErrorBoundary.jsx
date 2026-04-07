import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
            <AlertCircle size={48} style={{ color: '#e03e3e', margin: '0 auto 20px' }} />
            <h1 style={{ fontSize: '24px', marginBottom: '10px', color: '#1d1d1f' }}>
              Có lỗi xảy ra
            </h1>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              Rất tiếc, ứng dụng gặp phải lỗi không mong muốn. Vui lòng thử lại.
            </p>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                fontSize: '12px',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                  Chi tiết lỗi (Development only)
                </summary>
                <pre style={{
                  overflow: 'auto',
                  maxHeight: '200px',
                  padding: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#0071e3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                <RefreshCw size={16} />
                Thử lại
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f5f7',
                  color: '#0071e3',
                  border: '1px solid #d5d5d7',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
