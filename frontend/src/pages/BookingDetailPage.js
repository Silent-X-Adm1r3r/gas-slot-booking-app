import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FiArrowLeft, FiMapPin, FiCalendar, FiX, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fetchBookingById, cancelBooking, rescheduleBooking } from '../redux/slices/bookingSlice';
import { fetchProviderSlots } from '../redux/slices/providerSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { addDays } from 'date-fns';

const statusColors = {
  pending: 'status-pending', confirmed: 'status-confirmed',
  out_for_delivery: 'status-out_for_delivery', delivered: 'status-delivered', cancelled: 'status-cancelled',
};

function BookingDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBooking: booking, loading } = useSelector((s) => s.bookings);
  const { slots, slotsLoading } = useSelector((s) => s.providers);
  const [showReschedule, setShowReschedule] = useState(searchParams.get('action') === 'reschedule');
  const [rescheduleDate, setRescheduleDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedNewSlot, setSelectedNewSlot] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (showReschedule && booking) {
      dispatch(fetchProviderSlots({ providerId: booking.provider?._id, date: rescheduleDate }));
    }
  }, [showReschedule, rescheduleDate, booking, dispatch]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoading(true);
    try {
      await dispatch(cancelBooking({ id, reason: 'Cancelled by user from detail page' })).unwrap();
      toast.success('Booking cancelled.');
    } catch (err) {
      toast.error(err || 'Failed to cancel.');
    }
    setActionLoading(false);
  };

  const handleReschedule = async () => {
    if (!selectedNewSlot) { toast.error('Please select a new slot.'); return; }
    setActionLoading(true);
    try {
      await dispatch(rescheduleBooking({ id, newSlotId: selectedNewSlot, providerId: booking.provider?._id })).unwrap();
      toast.success('Booking rescheduled!');
      setShowReschedule(false);
    } catch (err) {
      toast.error(err || 'Reschedule failed.');
    }
    setActionLoading(false);
  };

  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEEE, MMMM d') };
  });

  if (loading) return <div className="py-5"><LoadingSpinner /></div>;
  if (!booking) return (
    <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-icon">📋</div>
      <div className="empty-title">Booking not found</div>
      <Link to="/my-bookings" className="btn-primary-custom mt-3"><FiArrowLeft size={15} /> Back to Bookings</Link>
    </div>
  );

  const canModify = ['pending', 'confirmed'].includes(booking.status);

  return (
    <div>
      <div className="page-header">
        <Container>
          <Link to="/my-bookings" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem' }}>
            <FiArrowLeft size={15} /> My Bookings
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="page-title">{booking.bookingId}</h1>
              <p className="page-subtitle">Booking Details</p>
            </div>
            <span className={`status-badge ${statusColors[booking.status] || ''}`} style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
              {booking.status?.replace('_', ' ')}
            </span>
          </div>
        </Container>
      </div>

      <Container>
        <Row>
          <Col lg={7} className="mb-4">
            {/* Provider Info */}
            <div className="gas-card mb-4">
              <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Provider</h5>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--bg-card2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', border: '1px solid var(--border)', flexShrink: 0 }}>⛽</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{booking.provider?.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{booking.provider?.category}</div>
                </div>
              </div>
            </div>

            {/* Delivery Slot */}
            <div className="gas-card mb-4">
              <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>
                <FiCalendar size={16} style={{ marginRight: '0.4rem', color: 'var(--primary)' }} />Delivery Slot
              </h5>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Date</div>
                  <div style={{ fontWeight: 600 }}>
                    {booking.slot?.date ? format(new Date(booking.slot.date), 'EEEE, MMMM d, yyyy') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Time</div>
                  <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                    {booking.slot?.startTime} – {booking.slot?.endTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="gas-card mb-4">
              <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>
                <FiMapPin size={16} style={{ marginRight: '0.4rem', color: 'var(--primary)' }} />Delivery Address
              </h5>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>
                {booking.deliveryAddress?.street},<br />
                {booking.deliveryAddress?.city}, {booking.deliveryAddress?.state} – {booking.deliveryAddress?.pincode}
              </p>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div className="gas-card mb-4">
                <h5 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Special Instructions</h5>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{booking.notes}</p>
              </div>
            )}

            {/* Reschedule Panel */}
            {showReschedule && canModify && (
              <div className="gas-card mb-4" style={{ border: '1px solid rgba(99,179,237,0.3)', background: 'rgba(99,179,237,0.04)' }}>
                <h5 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--info)' }}>
                  <FiRefreshCw size={16} style={{ marginRight: '0.4rem' }} />Reschedule Booking
                </h5>

                <div className="gas-form-group">
                  <label className="gas-label">New Date</label>
                  <select className="gas-select" value={rescheduleDate} onChange={(e) => { setRescheduleDate(e.target.value); setSelectedNewSlot(''); }}>
                    {dateOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>

                {slotsLoading ? <LoadingSpinner /> : slots.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No slots available. Try another date.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                    {slots.filter(s => s._id !== booking.slot?.slotId).map(slot => {
                      const rem = slot.capacity - slot.booked;
                      return (
                        <div key={slot._id} className={`slot-card ${selectedNewSlot === slot._id ? 'selected' : ''} ${rem <= 0 ? 'full' : ''}`}
                          onClick={() => rem > 0 && setSelectedNewSlot(slot._id)}>
                          <div className="slot-time">{slot.startTime} – {slot.endTime}</div>
                          <div className="slot-availability slot-available">{rem > 0 ? `${rem} left` : 'Full'}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-primary-custom" onClick={handleReschedule} disabled={actionLoading || !selectedNewSlot}>
                    {actionLoading ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </button>
                  <button className="btn-outline-custom" onClick={() => setShowReschedule(false)}>Cancel</button>
                </div>
              </div>
            )}
          </Col>

          {/* Sidebar */}
          <Col lg={5}>
            {/* Payment Info */}
            <div className="gas-card mb-4">
              <h5 style={{ fontWeight: 700, marginBottom: '1rem' }}>Payment</h5>
              <div className="booking-summary">
                <div className="booking-row">
                  <span className="booking-label">Cylinder ({booking.cylinderType} × {booking.quantity})</span>
                  <span>₹{booking.pricing?.cylinderPrice}</span>
                </div>
                <div className="booking-row">
                  <span className="booking-label">Delivery</span>
                  <span>₹{booking.pricing?.deliveryCharge}</span>
                </div>
                <div className="booking-row">
                  <span>Total</span>
                  <span>₹{booking.pricing?.total}</span>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>Payment Status:</span>
                <span className={`status-badge payment-${booking.payment?.status}`}>{booking.payment?.status}</span>
              </div>
              {booking.payment?.transactionId && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  TXN: {booking.payment.transactionId}
                </div>
              )}
            </div>

            {/* Actions */}
            {canModify && (
              <div className="gas-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Actions</h5>
                {!showReschedule && (
                  <button
                    style={{ background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.3)', color: 'var(--info)', padding: '0.65rem 1rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-main)', fontWeight: 600 }}
                    onClick={() => setShowReschedule(true)}
                  >
                    <FiRefreshCw size={15} /> Reschedule Delivery
                  </button>
                )}
                {booking.payment?.status === 'pending' && (
                  <button className="btn-primary-custom" style={{ justifyContent: 'center' }} onClick={() => navigate(`/payment/${booking._id}`)}>
                    Complete Payment
                  </button>
                )}
                <button
                  style={{ background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)', color: 'var(--danger)', padding: '0.65rem 1rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-main)', fontWeight: 600 }}
                  onClick={handleCancel}
                  disabled={actionLoading}
                >
                  <FiX size={15} /> Cancel Booking
                </button>
              </div>
            )}

            {booking.status === 'delivered' && (
              <div style={{ background: 'rgba(72,187,120,0.08)', border: '1px solid rgba(72,187,120,0.3)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center' }}>
                <FiCheckCircle size={32} color="var(--success)" />
                <h6 style={{ fontWeight: 700, marginTop: '0.75rem', color: 'var(--success)' }}>Delivered!</h6>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>Your gas was delivered successfully.</p>
                <Link to={`/providers/${booking.provider?._id}`} className="btn-outline-custom" style={{ fontSize: '0.85rem' }}>
                  Book Again
                </Link>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <div style={{ paddingBottom: '3rem' }} />
    </div>
  );
}

export default BookingDetailPage;
