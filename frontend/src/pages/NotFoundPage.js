import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FiArrowLeft } from 'react-icons/fi';

function NotFoundPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <Container>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>⛽</div>
        <h1 style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem' }}>
          Looks like this page ran out of gas. Let's get you back on track.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn-primary-custom">
            <FiArrowLeft size={15} /> Go Home
          </Link>
          <Link to="/providers" className="btn-outline-custom">Browse Providers</Link>
        </div>
      </Container>
    </div>
  );
}

export default NotFoundPage;
