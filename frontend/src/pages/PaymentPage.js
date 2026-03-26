import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiShield, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { fetchBookingById, createPaymentIntent, clearNewBooking } from '../redux/slices/bookingSlice';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CARD_OPTIONS = {
  style: {
    base: {
      color: '#F7FAFC',
      fontFamily: 'Poppins, sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#718096' },
    },
    invalid: { color: '#FC8181' },
  },
};

function PaymentForm({ booking }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    if (booking) {
      dispatch(createPaymentIntent(booking._id)).then((action) => {
        if (action.payload?.clientSecret) {
          setClientSecret(action.payload.clientSecret);
        }
      });
    }
  }, [booking, dispatch]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    try {
      const card = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (error) {
        toast.error(error.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        await api.post('/payments/confirm', {
          bookingId: booking._id,
          paymentIntentId: paymentIntent.id,
        });
        toast.success('🎉 Payment successful! Booking confirmed.');
        dispatch(clearNewBooking());
        navigate(`/my-bookings/${booking._id}`);
      }
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handlePay}>
      <div style={{ background: 'var(--bg-card2)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem', marginBottom: '1.25rem' }}>
        <label className="gas-label" style={{ marginBottom: '0.75rem' }}>Card Details</label>
        <CardElement options={CARD_OPTIONS} />
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '1rem' }}>
        🔒 Test mode: Use card 4242 4242 4242 4242, any future date, any CVV
      </p>

      <button
        type="submit"
        className="btn-primary-custom"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.9rem' }}
        disabled={!stripe || processing || !clientSecret}
      >
        {processing ? 'Processing...' : `Pay ₹${booking?.pricing?.total}`}
      </button>
    </form>
  );
}

function PaymentPage() {
  const { bookingId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBooking: booking, loading } = useSelector((s) => s.bookings);

  useEffect(() => {
    dispatch(fetchBookingById(bookingId));
  }, [bookingId, dispatch]);

  if (loading) return <div className="py-5"><LoadingSpinner /></div>;
  if (!booking) return (
    <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-icon">❌</div>
      <div className="empty-title">Booking not found</div>
    </div>
  );

  const slot = booking.slot;

  return (
    <div>
      <div className="page-header">
        <Container>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '1rem', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.85rem' }}>
            <FiArrowLeft size={15} /> Back
          </button>
          <h1 className="page-title">Complete Payment</h1>
          <p className="page-subtitle">Booking ID: {booking.bookingId}</p>
        </Container>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Row>
              {/* Payment Form */}
              <Col md={6} className="mb-4">
                <div className="gas-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <FiShield size={20} color="var(--success)" />
                    <h5 style={{ fontWeight: 700, margin: 0 }}>Secure Payment</h5>
                  </div>

                  <Elements stripe={stripePromise}>
                    <PaymentForm booking={booking} />
                  </Elements>

                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.7 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Your payment is secure.</strong> We use industry-standard SSL encryption via Stripe. We never store your card details.
                    </p>
                  </div>
                </div>
              </Col>

              {/* Order Summary */}
              <Col md={6} className="mb-4">
                <div className="gas-card h-100">
                  <h5 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Order Summary</h5>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius)', padding: '1rem', alignItems: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>⛽</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{booking.provider?.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{booking.provider?.category}</div>
                    </div>
                  </div>

                  {slot && (
                    <div style={{ background: 'rgba(255,107,53,0.08)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delivery Slot</div>
                      <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        {slot.date ? format(new Date(slot.date), 'EEEE, MMMM d') : ''} · {slot.startTime} – {slot.endTime}
                      </div>
                    </div>
                  )}

                  <div className="booking-summary">
                    <div className="booking-row">
                      <span className="booking-label">{booking.cylinderType} cylinder × {booking.quantity}</span>
                      <span>₹{booking.pricing?.cylinderPrice}</span>
                    </div>
                    <div className="booking-row">
                      <span className="booking-label">Delivery Charge</span>
                      <span>₹{booking.pricing?.deliveryCharge}</span>
                    </div>
                    <div className="booking-row">
                      <span>Total</span>
                      <span>₹{booking.pricing?.total}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    <h6 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Delivery Address</h6>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, margin: 0 }}>
                      {booking.deliveryAddress?.street},<br />
                      {booking.deliveryAddress?.city}, {booking.deliveryAddress?.state}<br />
                      {booking.deliveryAddress?.pincode}
                    </p>
                  </div>

                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(72,187,120,0.08)', border: '1px solid rgba(72,187,120,0.2)', borderRadius: 'var(--radius)' }}>
                    {[
                      'Gas cylinder delivered to your door',
                      'Real-time delivery tracking',
                      'Cancel up to 2 hours before delivery',
                    ].map(text => (
                      <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                        <FiCheckCircle size={13} />{text}
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
      <div style={{ paddingBottom: '3rem' }} />
    </div>
  );
}

export default PaymentPage;
