import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FiZap, FiGithub, FiMail, FiPhone } from 'react-icons/fi';

function Footer() {
  return (
    <footer className="gas-footer">
      <Container>
        <Row className="mb-3">
          <Col md={4} className="mb-3">
            <div className="footer-brand mb-2">
              <FiZap style={{ marginRight: '0.3rem' }} />GasSlot
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              The easiest way to book your gas cylinder delivery. Choose your provider, pick your slot, and get it delivered.
            </p>
          </Col>
          <Col md={2} className="mb-3">
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>Links</h6>
            {[
              ['/', 'Home'],
              ['/providers', 'Providers'],
              ['/my-bookings', 'My Bookings'],
              ['/profile', 'Profile'],
            ].map(([to, label]) => (
              <Link key={to} to={to} style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '0.5rem', fontSize: '0.85rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                {label}
              </Link>
            ))}
          </Col>
          <Col md={3} className="mb-3">
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>Categories</h6>
            {['Domestic', 'LPG', 'CNG', 'PNG', 'Commercial', 'Industrial'].map(cat => (
              <Link key={cat} to={`/providers?category=${cat}`}
                style={{ display: 'block', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '0.5rem', fontSize: '0.85rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                {cat} Gas
              </Link>
            ))}
          </Col>
          <Col md={3} className="mb-3">
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>Contact</h6>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <FiMail size={14} style={{ marginRight: '0.5rem' }} />support@gasslot.com
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <FiPhone size={14} style={{ marginRight: '0.5rem' }} />1800-GAS-SLOT
            </p>
          </Col>
        </Row>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
            © 2025 GasSlot. All rights reserved.
          </p>
          <a href="https://github.com" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FiGithub size={14} /> GitHub
          </a>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
