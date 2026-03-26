import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiUsers, FiPackage, FiDollarSign, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#FF6B35', '#63B3ED', '#48BB78', '#F6E05E', '#FC8181'];

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: statsData } = await api.get('/admin/stats');
        setData(statsData);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="py-5"><LoadingSpinner /></div>;
  if (!data) return <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div className="empty-title">Failed to load dashboard</div></div>;

  const statCards = [
    { label: 'Total Users', value: data.stats.totalUsers, icon: <FiUsers size={24} />, color: '#63B3ED' },
    { label: 'Total Bookings', value: data.stats.totalBookings, icon: <FiPackage size={24} />, color: '#FF6B35' },
    { label: 'Paid Bookings', value: data.stats.paidBookings, icon: <FiCheckCircle size={24} />, color: '#48BB78' },
    { label: 'Total Revenue', value: `₹${data.stats.totalRevenue?.toLocaleString()}`, icon: <FiDollarSign size={24} />, color: '#F6E05E' },
    { label: 'Active Providers', value: data.stats.totalProviders, icon: <FiTrendingUp size={24} />, color: '#FC8181' },
  ];

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueChartData = data.monthlyRevenue?.map(item => ({
    month: monthNames[item._id.month - 1],
    revenue: item.revenue,
    bookings: item.count,
  })) || [];

  const pieData = data.bookingsByStatus?.map(item => ({
    name: item._id?.replace('_', ' ') || 'Unknown',
    value: item.count,
  })) || [];

  return (
    <div>
      <div className="page-header">
        <Container>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and analytics</p>
        </Container>
      </div>

      <Container>
        {/* Stat Cards */}
        <Row className="mb-4">
          {statCards.map(card => (
            <Col xs={6} lg={true} key={card.label} className="mb-3">
              <div className="gas-card" style={{ textAlign: 'center' }}>
                <div style={{ color: card.color, marginBottom: '0.5rem' }}>{card.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: card.color, fontFamily: 'var(--font-mono)' }}>{card.value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{card.label}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="mb-4">
          {/* Revenue Chart */}
          <Col lg={8} className="mb-4">
            <div className="gas-card">
              <h5 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Monthly Revenue & Bookings</h5>
              {revenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueChartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                      labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="revenue" fill="#FF6B35" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
                    <Bar dataKey="bookings" fill="#63B3ED" radius={[4, 4, 0, 0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: '3rem' }}>No revenue data yet</div>
              )}
            </div>
          </Col>

          {/* Booking Status Pie */}
          <Col lg={4} className="mb-4">
            <div className="gas-card h-100">
              <h5 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Bookings by Status</h5>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="45%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: '3rem' }}>No booking data yet</div>
              )}
            </div>
          </Col>
        </Row>

        {/* Recent Bookings */}
        <div className="gas-card">
          <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Recent Bookings</h5>
          {data.recentBookings?.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>No bookings yet</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    {['Booking ID', 'Customer', 'Provider', 'Amount', 'Status', 'Date'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings?.map(b => (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontSize: '0.78rem' }}>{b.bookingId}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{b.user?.name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{b.provider?.name}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>₹{b.pricing?.total}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`status-badge status-${b.status}`}>{b.status?.replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Container>
      <div style={{ paddingBottom: '3rem' }} />
    </div>
  );
}

export default AdminDashboard;
