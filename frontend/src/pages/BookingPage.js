import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiCalendar, FiMapPin, FiPackage, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { addDays, format } from 'date-fns';
import { fetchProviderById, fetchProviderSlots } from '../redux/slices/providerSlice';
import { createBooking } from '../redux/slices/bookingSlice';
import LoadingSpinner from '../components/LoadingSpinner';

const addressSchema = Yup.object({
  cylinderType: Yup.string().required('Cylinder type is required'),
  quantity: Yup.number().min(1).max(5).required('Quantity is required'),
  slotId: Yup.string().required('Please select a time slot'),
  street: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  pincode: Yup.string().matches(/^\d{6}$/, 'Valid 6-digit pincode required').required(),
  notes: Yup.string().max(500),
});

function BookingPage() {
  const { providerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProvider, slots, slotsLoading } = useSelector((s) => s.providers);
  const { loading: bookingLoading } = useSelector((s) => s.bookings);
  const { user } = useSelector((s) => s.auth);
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchProviderById(providerId));
  }, [providerId, dispatch]);

  useEffect(() => {
    dispatch(fetchProviderSlots({ providerId, date: selectedDate }));
  }, [providerId, selectedDate, dispatch]);

  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(new Date(), i + 1);
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEEE, MMMM d') };
  });

  const handleSubmit = async (values) => {
    try {
      const bookingData = {
        providerId,
        slotId: values.slotId,
        cylinderType: values.cylinderType,
        quantity: parseInt(values.quantity),
        deliveryAddress: {
          street: values.street,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
        notes: values.notes,
        paymentMethod: 'stripe',
      };

      const result = await dispatch(createBooking(bookingData)).unwrap();
      toast.success('Booking created! Proceed to payment.');
      navigate(`/payment/${result.booking._id}`);
    } catch (err) {
      toast.error(err || 'Booking failed. Please try again.');
    }
  };

  if (!currentProvider) return <div className="py-5"><LoadingSpinner /></div>;

  const p = currentProvider;
  const preselectedSlot = searchParams.get('slotId') || '';

  const getCylinderPrice = (type, qty) => {
    const price = type === '14kg' ? p.pricing?.cylinder14kg : p.pricing?.cylinder5kg;
    return (price || 0) * (qty || 1);
  };

  return (
    <div>
      <div className="page-header">
        <Container>
          <h1 className="page-title">Book Gas Delivery</h1>
          <p className="page-subtitle">from {p.name}</p>
        </Container>
      </div>

      <Container>
        <Formik
          initialValues={{
            cylinderType: p.pricing?.cylinder14kg > 0 ? '14kg' : '5kg',
            quantity: 1,
            slotId: preselectedSlot,
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            pincode: user?.address?.pincode || '',
            notes: '',
          }}
          validationSchema={addressSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched }) => {
            const total = getCylinderPrice(values.cylinderType, values.quantity) + (p.pricing?.deliveryCharge || 0);

            return (
              <Form>
                <Row>
                  {/* Left - Booking Form */}
                  <Col lg={7}>
                    {/* Cylinder Selection */}
                    <div className="gas-card mb-4">
                      <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>
                        <FiPackage size={18} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                        Select Cylinder
                      </h5>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        {p.pricing?.cylinder14kg > 0 && (
                          <div
                            className={`slot-card ${values.cylinderType === '14kg' ? 'selected' : ''}`}
                            onClick={() => setFieldValue('cylinderType', '14kg')}
                          >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🛢️</div>
                            <div style={{ fontWeight: 700 }}>14 kg</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.25rem' }}>₹{p.pricing.cylinder14kg}</div>
                          </div>
                        )}
                        {p.pricing?.cylinder5kg > 0 && (
                          <div
                            className={`slot-card ${values.cylinderType === '5kg' ? 'selected' : ''}`}
                            onClick={() => setFieldValue('cylinderType', '5kg')}
                          >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💡</div>
                            <div style={{ fontWeight: 700 }}>5 kg</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.25rem' }}>₹{p.pricing.cylinder5kg}</div>
                          </div>
                        )}
                      </div>

                      <div className="gas-form-group">
                        <label className="gas-label">Quantity</label>
                        <Field as="select" name="quantity" className="gas-select">
                          {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n} cylinder{n > 1 ? 's' : ''}</option>
                          ))}
                        </Field>
                        <ErrorMessage name="quantity" component="div" className="error-msg" />
                      </div>
                    </div>

                    {/* Date & Slot */}
                    <div className="gas-card mb-4">
                      <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>
                        <FiCalendar size={18} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                        Select Delivery Slot
                      </h5>

                      <div className="gas-form-group">
                        <label className="gas-label">Delivery Date</label>
                        <select className="gas-select" value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setFieldValue('slotId', ''); }}>
                          {dateOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                        </select>
                      </div>

                      {slotsLoading ? <LoadingSpinner /> : (
                        <div>
                          <label className="gas-label">Available Time Slots</label>
                          {slots.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', background: 'var(--bg-card2)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                              No slots available on this date. Try another date.
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                              {slots.map(slot => {
                                const remaining = slot.capacity - slot.booked;
                                const isFull = remaining <= 0;
                                return (
                                  <div
                                    key={slot._id}
                                    className={`slot-card ${values.slotId === slot._id ? 'selected' : ''} ${isFull ? 'full' : ''}`}
                                    onClick={() => !isFull && setFieldValue('slotId', slot._id)}
                                  >
                                    <div className="slot-time">{slot.startTime} – {slot.endTime}</div>
                                    <div className={`slot-availability ${isFull ? '' : remaining <= 2 ? 'slot-almost-full' : 'slot-available'}`}>
                                      {isFull ? 'Full' : `${remaining} slot${remaining > 1 ? 's' : ''} left`}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {errors.slotId && touched.slotId && <div className="error-msg mt-2">{errors.slotId}</div>}
                        </div>
                      )}
                    </div>

                    {/* Delivery Address */}
                    <div className="gas-card mb-4">
                      <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>
                        <FiMapPin size={18} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />
                        Delivery Address
                      </h5>

                      <div className="gas-form-group">
                        <label className="gas-label">Street / Flat No.</label>
                        <Field name="street" className={`gas-input ${errors.street && touched.street ? 'error' : ''}`} placeholder="e.g. 42 MG Road, Apt 3B" />
                        <ErrorMessage name="street" component="div" className="error-msg" />
                      </div>

                      <Row>
                        <Col md={6}>
                          <div className="gas-form-group">
                            <label className="gas-label">City</label>
                            <Field name="city" className={`gas-input ${errors.city && touched.city ? 'error' : ''}`} placeholder="City" />
                            <ErrorMessage name="city" component="div" className="error-msg" />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="gas-form-group">
                            <label className="gas-label">State</label>
                            <Field name="state" className={`gas-input ${errors.state && touched.state ? 'error' : ''}`} placeholder="State" />
                            <ErrorMessage name="state" component="div" className="error-msg" />
                          </div>
                        </Col>
                      </Row>

                      <div className="gas-form-group">
                        <label className="gas-label">Pincode</label>
                        <Field name="pincode" className={`gas-input ${errors.pincode && touched.pincode ? 'error' : ''}`} placeholder="6-digit pincode" maxLength={6} />
                        <ErrorMessage name="pincode" component="div" className="error-msg" />
                      </div>

                      <div className="gas-form-group">
                        <label className="gas-label">Special Instructions (Optional)</label>
                        <Field as="textarea" name="notes" className="gas-input" rows={3} placeholder="Any specific instructions for the delivery person..." style={{ resize: 'vertical' }} />
                      </div>
                    </div>
                  </Col>

                  {/* Right - Order Summary */}
                  <Col lg={5}>
                    <div style={{ position: 'sticky', top: '80px' }}>
                      <div className="gas-card mb-4">
                        <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Order Summary</h5>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', background: 'var(--bg-card2)', borderRadius: 'var(--radius)', padding: '1rem', alignItems: 'center' }}>
                          <div style={{ fontSize: '2rem' }}>⛽</div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{p.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{p.address?.city}</div>
                          </div>
                        </div>

                        {values.slotId && (
                          <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Selected Slot</div>
                            {(() => {
                              const slot = slots.find(s => s._id === values.slotId);
                              return slot ? (
                                <div style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                                  {format(new Date(selectedDate), 'MMM d')} · {slot.startTime} – {slot.endTime}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}

                        <div className="booking-summary">
                          <div className="booking-row">
                            <span className="booking-label">{values.cylinderType} × {values.quantity}</span>
                            <span>₹{getCylinderPrice(values.cylinderType, values.quantity)}</span>
                          </div>
                          <div className="booking-row">
                            <span className="booking-label">Delivery Charge</span>
                            <span>₹{p.pricing?.deliveryCharge}</span>
                          </div>
                          <div className="booking-row">
                            <span>Total Amount</span>
                            <span>₹{total}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary-custom"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', padding: '0.9rem' }}
                        disabled={bookingLoading}
                      >
                        {bookingLoading ? 'Processing...' : <>Proceed to Payment · ₹{total} <FiArrowRight size={16} /></>}
                      </button>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textAlign: 'center', marginTop: '0.75rem' }}>
                        🔒 Secured by Stripe. Your payment info is encrypted.
                      </p>
                    </div>
                  </Col>
                </Row>
              </Form>
            );
          }}
        </Formik>
      </Container>
      <div style={{ paddingBottom: '3rem' }} />
    </div>
  );
}

export default BookingPage;
