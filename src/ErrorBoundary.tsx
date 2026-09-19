import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

// Tanpa Error Boundary, satu error React yang tidak tertangkap di mana pun dalam pohon
// komponen akan membuat React meng-unmount SELURUH aplikasi — layar HP jadi blank/putih
// tanpa penjelasan apa pun bagi pengguna. Komponen ini menangkap error tersebut dan
// menampilkan layar pemulihan sederhana, alih-alih layar kosong yang membingungkan.
export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Terjadi kesalahan tak terduga.' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Aplikasi mengalami error yang tidak tertangani:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          background: '#f8fafc',
          color: '#1e293b'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
          <h1 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>
            Terjadi Kendala pada Aplikasi
          </h1>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', maxWidth: '340px' }}>
            Data yang sedang diproses (misalnya gambar berukuran besar) mungkin melebihi kapasitas
            penyimpanan sementara di perangkat ini.
          </p>
          <p style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '20px', maxWidth: '340px', fontFamily: 'monospace' }}>
            {this.state.errorMessage}
          </p>
          <button
            onClick={this.handleReload}
            style={{
              background: '#0d9488',
              color: 'white',
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '12px 24px',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
