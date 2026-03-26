import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiZap, FiShield, FiClock, FiTruck, FiStar, FiArrowRight } from 'react-icons/fi';
import { fetchProviders } from '../redux/slices/providerSlice';
import ProviderCard from '../components/ProviderCard';
import LoadingSpinner from '../components/LoadingSpinner';

const features = [
  { icon: <FiShield size={28} />, title: 'Safe & Certified', desc: 'All providers are government-certified and safety-verified.' },
  { icon: <FiClock size={28} />, title: 'Flexible Slots', desc: 'Choose delivery windows that fit your schedule.' },
  { icon: <FiTruck size={28} />, title: 'Doorstep Delivery', desc: 'Gas cylinders delivered right to your door.' },
  { icon: <FiZap size={28} />, title: 'Instant Booking', desc: 'Book in under 2 minutes with secure payments.' },
];

const stats = [
  { number: '50K+', label: 'Happy Customers' },
  { number: '200+', label: 'Gas Providers' },
  { number: '15+', label: 'Cities Covered' },
  { number: '99.9%', label: 'Delivery Rate' },
];

function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: providers, loading } = useSelector((state) => state.providers);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchProviders({ limit: 6, sortBy: 'rating', order: 'desc' }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/providers?search=${searchQuery}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div style={{ animation: 'fadeInUp 0.8s ease both' }}>
                <span className="feature-chip" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
                  <FiZap size={12} /> Trusted Gas Delivery Platform
                </span>
                <h1 className="hero-title">
                  Book Your Gas<br />
                  Delivery in <span className="hero-highlight">Minutes</span>
                </h1>
                <p className="hero-subtitle">
                  Choose from 200+ certified gas providers. Pick your preferred time slot, pay securely, and get your cylinder delivered on time.
                </p>

                <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                  <div className="search-bar">
                    <FiSearch size={18} style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }} />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search gas providers or city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="btn-primary-custom">
                      Search
                    </button>
                  </div>
                </form>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/providers" className="btn-primary-custom">
                    Browse Providers <FiArrowRight size={16} />
                  </Link>
                  <Link to="/register" className="btn-outline-custom">
                    Get Started Free
                  </Link>
                </div>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{
                  width: 420, height: 420, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.05) 50%, transparent 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: 'auto', fontSize: '10rem',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  🛢️
                </div>
                <style>{`
                  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                  @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                `}</style>
                {/* Floating cards */}
                {[
                  { top: '10%', left: '0', text: '⚡ Instant Booking', color: 'var(--primary)' },
                  { top: '60%', right: '0', text: '🔒 Secure Payment', color: 'var(--success)' },
                  { bottom: '10%', left: '10%', text: '🚚 Fast Delivery', color: 'var(--info)' },
                ].map((card, i) => (
                  <div key={i} style={{
                    position: 'absolute', ...{ top: card.top, left: card.left, right: card.right, bottom: card.bottom },
                    background: 'var(--bg-card)',
                    border: `1px solid ${card.color}40`,
                    borderRadius: 12, padding: '0.75rem 1.25rem',
                    fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
                    boxShadow: `0 4px 20px ${card.color}30`,
                    whiteSpace: 'nowrap',
                    animation: `float ${2.5 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`
                  }}>
                    {card.text}
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 0', background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <Container>
          <Row>
            {stats.map((stat) => (
              <Col xs={6} md={3} key={stat.label} className="mb-3 mb-md-0">
                <div className="stat-card">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose GasSlot?</h2>
            <p className="section-subtitle">Everything you need for a seamless gas booking experience</p>
          </div>
          <Row>
            {features.map((f) => (
              <Col md={6} lg={3} key={f.title} className="mb-4">
                <div className="gas-card h-100">
                  <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{f.icon}</div>
                  <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h5>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Featured Providers */}
      <section className="section" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="section-title mb-1">Top-Rated Providers</h2>
              <p className="section-subtitle mb-0">Trusted by thousands of customers</p>
            </div>
            <Link to="/providers" className="btn-outline-custom">
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-5"><LoadingSpinner /></div>
          ) : (
            <Row>
              {providers.slice(0, 6).map((provider) => (
                <Col md={6} lg={4} key={provider._id} className="mb-4">
                  <ProviderCard provider={provider} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <Container>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.05) 100%)',
            border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem 2rem',
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Ready to Book Your Gas? 🛢️
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
              Join 50,000+ customers who trust GasSlot for their gas cylinder delivery needs.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary-custom" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
                Start Booking <FiArrowRight size={18} />
              </Link>
              <Link to="/providers" className="btn-outline-custom" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
                Explore Providers
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default HomePage;
