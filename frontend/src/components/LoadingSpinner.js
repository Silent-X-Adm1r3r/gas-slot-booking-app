import React from 'react';

function LoadingSpinner({ fullScreen, size = 40 }) {
  const spinner = (
    <div
      style={{
        width: size, height: size,
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }}
    />
  );

  return (
    <div className={`spinner-wrapper ${fullScreen ? 'full-screen' : ''}`}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
