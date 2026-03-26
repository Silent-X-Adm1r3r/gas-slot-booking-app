// LoginPage.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Container, Row, Col } from 'react-bootstrap';
import { FiZap, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { loginUser } from '../redux/slices/authSlice';

const loginSchema = Yup.object({
  email: Yup.string().email('Valid email required').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useSelector((s) => s.auth);
  const from = location.state?.from?.pathname || '/providers';

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err || 'Login failed.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(ellipse at 30% 50%, rgba(255,107,53,0.08) 0%, transparent 60%), var(--bg)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={5} lg={4}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
                <FiZap size={24} style={{ marginRight: '0.3rem' }} />GasSlot
              </Link>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Welcome back</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to manage your bookings</p>
            </div>

            <div className="gas-card">
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form>
                    <div className="gas-form-group">
                      <label className="gas-label"><FiMail size={13} style={{ marginRight: '0.3rem' }} />Email</label>
                      <Field type="email" name="email" className={`gas-input ${errors.email && touched.email ? 'error' : ''}`} placeholder="you@example.com" />
                      <ErrorMessage name="email" component="div" className="error-msg" />
                    </div>

                    <div className="gas-form-group">
                      <label className="gas-label"><FiLock size={13} style={{ marginRight: '0.3rem' }} />Password</label>
                      <Field type="password" name="password" className={`gas-input ${errors.password && touched.password ? 'error' : ''}`} placeholder="Your password" />
                      <ErrorMessage name="password" component="div" className="error-msg" />
                    </div>

                    <button type="submit" className="btn-primary-custom" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }} disabled={isSubmitting || loading}>
                      {isSubmitting || loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </Form>
                )}
              </Formik>

              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-card2)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                Demo: <strong style={{ color: 'var(--text-primary)' }}>user@gasslot.com</strong> / <strong style={{ color: 'var(--text-primary)' }}>user123456</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default LoginPage;
