import React, { useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import { fetchProviders, fetchCategories, setFilters, clearFilters } from '../redux/slices/providerSlice';
import ProviderCard from '../components/ProviderCard';
import LoadingSpinner from '../components/LoadingSpinner';

function ProvidersPage() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list, loading, categories, filters, pagination } = useSelector((state) => state.providers);

  // Sync URL params with filters
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || 'All';
    if (urlSearch || urlCategory !== 'All') {
      dispatch(setFilters({ search: urlSearch, category: urlCategory }));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const loadProviders = useCallback(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category && filters.category !== 'All') params.category = filters.category;
    if (filters.city) params.city = filters.city;
    if (filters.minRating) params.minRating = filters.minRating;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    dispatch(fetchProviders(params));
  }, [filters, dispatch]);

  useEffect(() => {
    const timer = setTimeout(loadProviders, 400);
    return () => clearTimeout(timer);
  }, [loadProviders]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchParams({});
  };

  const hasActiveFilters = filters.search || filters.category !== 'All' || filters.city || filters.minRating;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <Container>
          <h1 className="page-title">Gas Providers</h1>
          <p className="page-subtitle">Find and book from {pagination.total || 0}+ certified gas providers near you</p>
        </Container>
      </div>

      <Container>
        {/* Search & Filters */}
        <div className="gas-card mb-4" style={{ borderRadius: 'var(--radius-lg)' }}>
          <Row className="align-items-end g-3">
            <Col md={4}>
              <label className="gas-label"><FiSearch size={13} style={{ marginRight: '0.3rem' }} />Search</label>
              <div style={{ position: 'relative' }}>
                <FiSearch size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="gas-input"
                  placeholder="Provider name or city..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </Col>

            <Col md={2}>
              <label className="gas-label">City</label>
              <input
                type="text"
                className="gas-input"
                placeholder="Filter by city"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </Col>

            <Col md={2}>
              <label className="gas-label">Min Rating</label>
              <select className="gas-select" value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)}>
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ ⭐</option>
                <option value="4">4.0+ ⭐</option>
                <option value="3.5">3.5+ ⭐</option>
              </select>
            </Col>

            <Col md={2}>
              <label className="gas-label"><FiSliders size={13} style={{ marginRight: '0.3rem' }} />Sort By</label>
              <select className="gas-select" value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
                <option value="rating">Top Rated</option>
                <option value="name">Name A-Z</option>
                <option value="createdAt">Newest</option>
              </select>
            </Col>

            <Col md={2}>
              {hasActiveFilters && (
                <button className="btn-outline-custom" style={{ width: '100%', justifyContent: 'center' }} onClick={handleClearFilters}>
                  <FiX size={15} /> Clear
                </button>
              )}
            </Col>
          </Row>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${filters.category === cat ? 'active' : ''}`}
              onClick={() => handleFilterChange('category', cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {!loading && `${pagination.total || list.length} providers found`}
        </div>

        {loading ? (
          <div className="py-5"><LoadingSpinner /></div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⛽</div>
            <div className="empty-title">No providers found</div>
            <p>Try adjusting your search or filters</p>
            <button className="btn-primary-custom mt-3" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <Row>
              {list.map((provider) => (
                <Col md={6} lg={4} key={provider._id} className="mb-4">
                  <ProviderCard provider={provider} />
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => dispatch(fetchProviders({ ...filters, page }))}
                    style={{
                      width: 40, height: 40, borderRadius: 8,
                      border: `1.5px solid ${page === pagination.page ? 'var(--primary)' : 'var(--border)'}`,
                      background: page === pagination.page ? 'var(--primary)' : 'var(--bg-card)',
                      color: page === pagination.page ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer', fontWeight: 600, transition: 'var(--transition)'
                    }}
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

export default ProvidersPage;
