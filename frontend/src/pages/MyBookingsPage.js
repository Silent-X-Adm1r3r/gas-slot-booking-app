import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiEye, FiX, FiRefreshCw, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fetchMyBookings, cancelBooking } from '../redux/slices/bookingSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  out_for_delivery: 'status-out_for_delivery',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
  rescheduled: 'status-confirmed',
};

const statusTabs = ['all', 'pending', 'confirmed', 'delivered', 'cancelled'];

function MyBookingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: bookings, loading, pagination } = useSelector((s) => s.bookings);
  const [activeTab, setActiveTab] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyBookings({ status: activeTab === 'all' ? undefined : activeTab }));
  }, [activeTab, dispatch]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setCancellingId(bookingId);
      await dispatch(cancelBooking({ id: bookingId, reason: 'Cancelled by user' })).unwrap();
      toast.success('Booking cancelled successfully.');
    } catch (err) {
      toast.error(err || 'Cancellation failed.');
    }
    setCancellingId(null);
  };

  return (
    <div>
      <div className="page-header">
        <Container>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track and manage all your gas delivery bookings</p>
        </Container>
      </div>

      <Container>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {statusTabs.map(tab => (
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
              {tab === 'all' ? 'All Bookings' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-5"><LoadingSpinner /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No bookings found</div>
            <p>You haven't made any {activeTab !== 'all' ? activeTab : ''} bookings yet.</p>
            <Link to="/providers" className="btn-primary-custom mt-3">Browse Providers</Link>
          </div>
        ) : (
          <>
            {bookings.map(booking => (
              <div key={booking._id} className="gas-card mb-3" style={{ padding: '1.25rem' }}>
                <Row className="align-items-center">
                  <Col md={1} className="mb-2 mb-md-0">
                    <div style={{ width: 50, height: 50, borderRadius: 12, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: '1px solid var(--border)' }}>
                      ⛽
                    </div>
                  </Col>

                  <Col md={4} className="mb-2 mb-md-0">
                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                      {booking.provider?.name}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                      {booking.bookingId}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                      {booking.cylinderType} × {booking.quantity}
                    </div>
                  </Col>

                  <Col md={3} className="mb-2 mb-md-0">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                      <FiCalendar size={12} />
                      {booking.slot?.date ? format(new Date(booking.slot.date), 'MMM d, yyyy') : 'N/A'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <FiClock size={12} />
                      {booking.slot?.startTime} – {booking.slot?.endTime}
                    </div>
                  </Col>

                  <Col md={2} className="mb-2 mb-md-0">
                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                      ₹{booking.pricing?.total}
                    </div>
                    <span className={`status-badge ${statusColors[booking.status] || ''}`}>
                      {booking.status?.replace('_', ' ')}
                    </span>
                  </Col>

                  <Col md={2}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button
                        className="btn-outline-custom"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                        onClick={() => navigate(`/my-bookings/${booking._id}`)}
                      >
                        <FiEye size={13} /> View
                      </button>

                      {['pending', 'confirmed'].includes(booking.status) && (
                        <>
                          <button
                            style={{ background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.3)', color: 'var(--info)', padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-main)' }}
                            onClick={() => navigate(`/my-bookings/${booking._id}?action=reschedule`)}
                          >
                            <FiRefreshCw size={12} /> Reschedule
                          </button>
                          <button
                            style={{ background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)', color: 'var(--danger)', padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-main)' }}
                            onClick={() => handleCancel(booking._id)}
                            disabled={cancellingId === booking._id}
                          >
                            <FiX size={12} /> {cancellingId === booking._id ? '...' : 'Cancel'}
                          </button>
                        </>
                      )}

                      {booking.status === 'pending' && booking.payment?.status === 'pending' && (
                        <button
                          className="btn-primary-custom"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}
                          onClick={() => navigate(`/payment/${booking._id}`)}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => dispatch(fetchMyBookings({ page, status: activeTab === 'all' ? undefined : activeTab }))}
                    style={{ width: 38, height: 38, borderRadius: 8, border: `1.5px solid ${page === pagination.page ? 'var(--primary)' : 'var(--border)'}`, background: page === pagination.page ? 'var(--primary)' : 'var(--bg-card)', color: page === pagination.page ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Container>
      <div style={{ paddingBottom: '3rem' }} />
    </div>
  );
}

export default MyBookingsPage;
