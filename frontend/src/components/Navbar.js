import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { FiZap, FiLogOut, FiUser, FiCalendar, FiShield } from 'react-icons/fi';
import { logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

function GasNavbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
    setExpanded(false);
  };

  return (
    <Navbar
      expand="lg"
      className="gas-navbar"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <Link to="/" className="navbar-brand-custom" onClick={() => setExpanded(false)}>
          <FiZap style={{ marginRight: '0.3rem', color: 'var(--primary)' }} />
          Gas<span>Slot</span>
        </Link>

        <Navbar.Toggle
          aria-controls="main-nav"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        />

        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto ms-4">
            <NavLink
              to="/providers"
              className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              Providers
            </NavLink>
            {isAuthenticated && (
              <NavLink
                to="/my-bookings"
                className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
                onClick={() => setExpanded(false)}
              >
                My Bookings
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
                onClick={() => setExpanded(false)}
              >
                <FiShield size={14} style={{ marginRight: '0.3rem' }} />
                Admin
              </NavLink>
            )}
          </Nav>

          <Nav className="ms-auto align-items-center gap-2">
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                    <div
                      style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--primary)', color: 'white',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.85rem', marginRight: '0.5rem'
                      }}
                    >
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    {user?.name}
                  </span>
                }
                id="user-dropdown"
                align="end"
                menuVariant="dark"
                style={{ '--bs-dropdown-bg': 'var(--bg-card)', '--bs-dropdown-border-color': 'var(--border)' }}
              >
                <NavDropdown.Item as={Link} to="/profile" onClick={() => setExpanded(false)} style={{ color: 'var(--text-primary)' }}>
                  <FiUser size={14} style={{ marginRight: '0.5rem' }} />Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-bookings" onClick={() => setExpanded(false)} style={{ color: 'var(--text-primary)' }}>
                  <FiCalendar size={14} style={{ marginRight: '0.5rem' }} />My Bookings
                </NavDropdown.Item>
                <NavDropdown.Divider style={{ borderColor: 'var(--border)' }} />
                <NavDropdown.Item onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                  <FiLogOut size={14} style={{ marginRight: '0.5rem' }} />Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Link to="/login" className="btn-outline-custom" onClick={() => setExpanded(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary-custom" onClick={() => setExpanded(false)}>
                  Register
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default GasNavbar;
