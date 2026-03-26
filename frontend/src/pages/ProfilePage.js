import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FiUser, FiLock, FiSave, FiMail, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { updateProfile } from '../redux/slices/authSlice';
import api from '../utils/api';

const profileSchema = Yup.object({
  name: Yup.string().min(2).required('Name is required'),
  phone: Yup.string().matches(/^\d{10}$/, '10-digit phone number required').required(),
  street: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  pincode: Yup.string().matches(/^\d{6}$/, '6-digit pincode').nullable(),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password required'),
  newPassword: Yup.string().min(6, 'At least 6 characters').required('New password required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required(),
});

function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      await dispatch(updateProfile({
        name: values.name,
        phone: values.phone,
        address: { street: values.street, city: values.city, state: values.state, pincode: values.pincode }
      })).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err || 'Update failed.');
    }
    setSubmitting(false);
  };

  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed successfully!');
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed.');
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <Container>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.1rem' }}>{user?.name}</h1>
              <p className="page-subtitle" style={{ marginBottom: 0 }}>
                <FiMail size={13} style={{ marginRight: '0.3rem' }} />{user?.email}
                {user?.role !== 'user' && <span style={{ marginLeft: '0.75rem', background: 'rgba(255,107,53,0.15)', color: 'var(--primary)', padding: '0.15rem 0.6rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{user?.role}</span>}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <Row>
          <Col lg={3} className="mb-4">
            <div className="gas-card">
              {['profile', 'security'].map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem',
                    background: activeTab === tab ? 'rgba(255,107,53,0.1)' : 'none',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-main)',
                    color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: activeTab === tab ? 700 : 500,
                    marginBottom: '0.25rem', textAlign: 'left', transition: 'all 0.2s', fontSize: '0.9rem'
                  }}
                >
                  {tab === 'profile' ? <FiUser size={16} /> : <FiLock size={16} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </Col>

          <Col lg={9}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="gas-card">
                <h5 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
                  <FiUser size={18} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />Profile Information
                </h5>

                <Formik
                  initialValues={{
                    name: user?.name || '',
                    phone: user?.phone || '',
                    street: user?.address?.street || '',
                    city: user?.address?.city || '',
                    state: user?.address?.state || '',
                    pincode: user?.address?.pincode || '',
                  }}
                  validationSchema={profileSchema}
                  onSubmit={handleProfileUpdate}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form>
                      <Row>
                        <Col md={6}>
                          <div className="gas-form-group">
                            <label className="gas-label">Full Name</label>
                            <Field name="name" className={`gas-input ${errors.name && touched.name ? 'error' : ''}`} />
                            <ErrorMessage name="name" component="div" className="error-msg" />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="gas-form-group">
                            <label className="gas-label">Email (cannot change)</label>
                            <input className="gas-input" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                          </div>
                        </Col>
                      </Row>

                      <div className="gas-form-group">
                        <label className="gas-label">
                          <FiPhone size={13} style={{ marginRight: '0.3rem' }} />Phone Number
                        </label>
                        <Field name="phone" className={`gas-input ${errors.phone && touched.phone ? 'error' : ''}`} placeholder="10-digit phone number" />
                        <ErrorMessage name="phone" component="div" className="error-msg" />
                      </div>

                      <h6 style={{ fontWeight: 700, marginBottom: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Default Delivery Address</h6>

                      <div className="gas-form-group">
                        <label className="gas-label">Street / Flat</label>
                        <Field name="street" className="gas-input" placeholder="e.g. 42 MG Road, Apt 3B" />
                      </div>

                      <Row>
                        <Col md={4}>
                          <div className="gas-form-group">
                            <label className="gas-label">City</label>
                            <Field name="city" className="gas-input" placeholder="City" />
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="gas-form-group">
                            <label className="gas-label">State</label>
                            <Field name="state" className="gas-input" placeholder="State" />
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="gas-form-group">
                            <label className="gas-label">Pincode</label>
                            <Field name="pincode" className={`gas-input ${errors.pincode && touched.pincode ? 'error' : ''}`} placeholder="6-digit" maxLength={6} />
                            <ErrorMessage name="pincode" component="div" className="error-msg" />
                          </div>
                        </Col>
                      </Row>

                      <button type="submit" className="btn-primary-custom" disabled={isSubmitting}>
                        <FiSave size={15} />{isSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="gas-card">
                <h5 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
                  <FiLock size={18} style={{ marginRight: '0.5rem', color: 'var(--primary)' }} />Change Password
                </h5>

                <Formik
                  initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
                  validationSchema={passwordSchema}
                  onSubmit={handlePasswordChange}
                >
                  {({ isSubmitting, errors, touched }) => (
                    <Form style={{ maxWidth: 400 }}>
                      <div className="gas-form-group">
                        <label className="gas-label">Current Password</label>
                        <Field type="password" name="currentPassword" className={`gas-input ${errors.currentPassword && touched.currentPassword ? 'error' : ''}`} />
                        <ErrorMessage name="currentPassword" component="div" className="error-msg" />
                      </div>
                      <div className="gas-form-group">
                        <label className="gas-label">New Password</label>
                        <Field type="password" name="newPassword" className={`gas-input ${errors.newPassword && touched.newPassword ? 'error' : ''}`} />
                        <ErrorMessage name="newPassword" component="div" className="error-msg" />
                      </div>
                      <div className="gas-form-group">
                        <label className="gas-label">Confirm New Password</label>
                        <Field type="password" name="confirmPassword" className={`gas-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`} />
                        <ErrorMessage name="confirmPassword" component="div" className="error-msg" />
                      </div>
                      <button type="submit" className="btn-primary-custom" disabled={isSubmitting}>
                        <FiLock size={15} />{isSubmitting ? 'Changing...' : 'Change Password'}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            )}
          </Col>
        </Row>
      </Container>
      <div style={{ paddingBottom: '3rem' }} />
    </div>
  );
}

export default ProfilePage;
