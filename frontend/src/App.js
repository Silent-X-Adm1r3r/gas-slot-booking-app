import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import 'bootstrap/dist/css/bootstrap.min.css';

import store from './redux/store';
import { fetchCurrentUser } from './redux/slices/authSlice';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import ProfilePage from './pages/ProfilePage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import './styles/global.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function AppContent() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser()).finally(() => setInitializing(false));
    } else {
      setInitializing(false);
    }
  }, [token, dispatch]);

  if (initializing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/providers" replace /> : <LoginPage />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/providers" replace /> : <RegisterPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/providers/:id" element={<ProviderDetailPage />} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/book/:providerId" element={<BookingPage />} />
              <Route path="/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Elements stripe={stripePromise}>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '8px', fontFamily: 'Poppins, sans-serif' }
          }}
        />
      </Elements>
    </Provider>
  );
}

export default App;
