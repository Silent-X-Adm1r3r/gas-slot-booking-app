import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FiStar, FiMapPin, FiPhone, FiMail, FiCheckCircle, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { fetchProviderById, fetchProviderSlots } from '../redux/slices/providerSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, addDays } from 'date-fns';

const categoryEmojis = {
  Domestic: '🏠', LPG: '🛢️', CNG: '♻️',
  PNG: '🏗️', Commercial: '🏢', Industrial: '🏭'
};

function ProviderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProvider, loading, slots, slotsLoading } = useSelector((s) => s.providers);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchProviderById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchProviderSlots({ providerId: id, date: selectedDate }));
    }
  }, [id, selectedDate, isAuthenticated, dispatch]);

  if (loading) return <div className="py-5"><LoadingSpinner /></div>;
  if (!currentProvider) return (
    <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-icon">⛽</div>
      <div className="empty-title">Provider not found</div>
      <Link to="/providers" className="btn-primary-custom mt-3"><FiArrowLeft size={15} /> Back to Providers</Link>
    </div>
  );

  const p = currentProvider;
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE, MMM d') };
  });

  const tabs = ['overview', 'slots', 'reviews'];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Container>
          <Link to="/providers" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
            <FiArrowLeft size={15} /> Back to Providers
          </Link>
          <Row className="align-items-center">
            <Col md={1} className="mb-3 mb-md-0">
              <div style={{ width: 80, height: 80, borderRadius: 16, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '1px solid var(--border)' }}>
                {categoryEmojis[p.category] || '⛽'}
              </div>
            </Col>
            <Col md={7}>
              <span className="provider-badge" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{p.category}</span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.25rem' }}>{p.name}</h1>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span><FiMapPin size={13} style={{ marginRight: '0.3rem' }} />{p.address?.city}, {p.address?.state}</span>
                <span className="provider-rating"><FiStar size={13} fill="currentColor" /> {p.rating?.toFixed(1)} ({p.totalReviews} reviews)</span>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <button
                className="btn-primary-custom"
                style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}
                onClick={() => isAuthenticated ? navigate(`/book/${id}`) : navigate('/login')}
              >
                <FiCalendar size={16} /> Book a Slot
              </button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {tabs.map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '0.75rem 1.25rem',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 700 : 500,
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.9rem', textTransform: 'capitalize',
                transition: 'all 0.2s', marginBottom: '-1px'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <Row>
          <Col lg={8}>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="gas-card mb-4">
                  <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>About</h5>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{p.description}</p>
                </div>

                <div className="gas-card mb-4">
                  <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Pricing</h5>
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {p.pricing?.cylinder14kg > 0 && (
                      <div className="booking-row">
                        <span className="booking-label">14kg Cylinder</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.pricing.cylinder14kg}</span>
                      </div>
                    )}
                    {p.pricing?.cylinder5kg > 0 && (
                      <div className="booking-row">
                        <span className="booking-label">5kg Cylinder</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.pricing.cylinder5kg}</span>
                      </div>
                    )}
                    <div className="booking-row">
                      <span className="booking-label">Delivery Charge</span>
                      <span style={{ fontWeight: 700 }}>₹{p.pricing?.deliveryCharge}</span>
                    </div>
                  </div>
                </div>

                {p.features?.length > 0 && (
                  <div className="gas-card mb-4">
                    <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Features</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {p.features.map(f => (
                        <span key={f} className="feature-chip"><FiCheckCircle size={12} />{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {p.serviceAreas?.length > 0 && (
                  <div className="gas-card mb-4">
                    <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Service Areas</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {p.serviceAreas.map(a => (
                        <span key={a} style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          <FiMapPin size={11} style={{ marginRight: '0.3rem' }} />{a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Slots Tab */}
            {activeTab === 'slots' && (
              <div>
                {!isAuthenticated ? (
                  <div className="gas-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                    <h5>Login to View Available Slots</h5>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create an account to book your preferred delivery slot.</p>
                    <Link to="/login" className="btn-primary-custom">Login / Register</Link>
                  </div>
                ) : (
                  <div>
                    <div className="gas-card mb-4">
                      <label className="gas-label"><FiCalendar size={13} style={{ marginRight: '0.3rem' }} />Select Date</label>
                      <select className="gas-select" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
                        {dateOptions.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>

                    {slotsLoading ? (
                      <LoadingSpinner />
                    ) : slots.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <div className="empty-title">No slots available for this date</div>
                        <p>Try selecting a different date.</p>
                      </div>
                    ) : (
                      <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                          {slots.length} slot{slots.length !== 1 ? 's' : ''} available — Click a slot to book
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                          {slots.map(slot => {
                            const remaining = slot.capacity - slot.booked;
                            const isFull = remaining <= 0;
                            return (
                              <div
                                key={slot._id}
                                className={`slot-card ${isFull ? 'full' : ''}`}
                                onClick={() => !isFull && navigate(`/book/${id}?slotId=${slot._id}&date=${selectedDate}`)}
                              >
                                <div className="slot-time">{slot.startTime} – {slot.endTime}</div>
                                <div className={`slot-availability ${isFull ? 'status-cancelled' : remaining <= 2 ? 'slot-almost-full' : 'slot-available'}`}>
                                  {isFull ? 'Full' : `${remaining} left`}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button className="btn-primary-custom mt-4 w-100" style={{ justifyContent: 'center' }} onClick={() => navigate(`/book/${id}`)}>
                          <FiCalendar size={16} /> Continue to Full Booking
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {p.reviews?.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <div className="empty-title">No reviews yet</div>
                    <p>Be the first to review this provider after booking.</p>
                  </div>
                ) : (
                  p.reviews?.map((r, i) => (
                    <div key={i} className="gas-card mb-3">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 600 }}>{r.userName}</div>
                        <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <div className="gas-card mb-4">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem' }}>Contact Info</h6>
              {p.contact?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <FiPhone size={14} color="var(--primary)" />{p.contact.phone}
                </div>
              )}
              {p.contact?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <FiMail size={14} color="var(--primary)" />{p.contact.email}
                </div>
              )}
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🚀</div>
              <h6 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Ready to Book?</h6>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Select your slot and get gas delivered to your doorstep.</p>
              <button
                className="btn-primary-custom"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => isAuthenticated ? navigate(`/book/${id}`) : navigate('/login')}
              >
                Book Now
              </button>
            </div>
          </Col>
        </Row>
      </Container>
      <div style={{ paddingBottom: '3rem' }} />
    </div>
  );
}

export default ProviderDetailPage;
