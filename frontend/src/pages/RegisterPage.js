import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col } from 'react-bootstrap';
import { FiZap, FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { registerUser } from '../redux/slices/authSlice';

const registerSchema = Yup.object({
  name: Yup.string().min(2, 'At least 2 characters').required('Name is required'),
  email: Yup.string().email('Valid email required').required('Email is required'),
  password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match').required('Confirm password'),
  phone: Yup.string().matches(/^\d{10}$/, '10-digit phone number').required('Phone required'),
});

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
      })).unwrap();
      toast.success('Account created! Welcome to GasSlot 🎉');
      navigate('/providers');
    } catch (err) {
      toast.error(err || 'Registration failed.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '2rem 0', background: 'radial-gradient(ellipse at 70% 30%, rgba(255,107,53,0.08) 0%, transparent 60%), var(--bg)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                <FiZap size={24} style={{ marginRight: '0.3rem' }} />GasSlot
              </Link>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Create your account</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join 50,000+ customers booking gas online</p>
            </div>

            <div className="gas-card">
              <Formik
                initialValues={{ name: '', email: '', password: '', confirmPassword: '', phone: '' }}
                validationSchema={registerSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <Row>
                      <Col md={12}>
                        <div className="gas-form-group">
                          <label className="gas-label"><FiUser size={13} style={{ marginRight: '0.3rem' }} />Full Name</label>
                          <Field name="name" className={`gas-input ${errors.name && touched.name ? 'error' : ''}`} placeholder="John Doe" />
                          <ErrorMessage name="name" component="div" className="error-msg" />
                        </div>
                      </Col>
                    </Row>

                    <div className="gas-form-group">
                      <label className="gas-label"><FiMail size={13} style={{ marginRight: '0.3rem' }} />Email</label>
                      <Field type="email" name="email" className={`gas-input ${errors.email && touched.email ? 'error' : ''}`} placeholder="you@example.com" />
                      <ErrorMessage name="email" component="div" className="error-msg" />
                    </div>

                    <div className="gas-form-group">
                      <label className="gas-label"><FiPhone size={13} style={{ marginRight: '0.3rem' }} />Phone Number</label>
                      <Field name="phone" className={`gas-input ${errors.phone && touched.phone ? 'error' : ''}`} placeholder="10-digit phone" maxLength={10} />
                      <ErrorMessage name="phone" component="div" className="error-msg" />
                    </div>

                    <div className="gas-form-group">
                      <label className="gas-label"><FiLock size={13} style={{ marginRight: '0.3rem' }} />Password</label>
                      <Field type="password" name="password" className={`gas-input ${errors.password && touched.password ? 'error' : ''}`} placeholder="At least 6 characters" />
                      <ErrorMessage name="password" component="div" className="error-msg" />
                    </div>

                    <div className="gas-form-group">
                      <label className="gas-label">Confirm Password</label>
                      <Field type="password" name="confirmPassword" className={`gas-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`} placeholder="Repeat your password" />
                      <ErrorMessage name="confirmPassword" component="div" className="error-msg" />
                    </div>

                    <button type="submit" className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginTop: '0.5rem' }} disabled={isSubmitting || loading}>
                      {isSubmitting || loading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </Form>
                )}
              </Formik>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
              </div>
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '1rem' }}>
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RegisterPage;
