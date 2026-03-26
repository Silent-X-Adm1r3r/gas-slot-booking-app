import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiMapPin, FiCheckCircle } from 'react-icons/fi';

const categoryEmojis = {
  Domestic: '🏠', LPG: '🛢️', CNG: '♻️',
  PNG: '🏗️', Commercial: '🏢', Industrial: '🏭'
};

function ProviderCard({ provider }) {
  const navigate = useNavigate();

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.round(provider.rating) ? 'var(--accent)' : 'var(--border)' }}>★</span>
  ));

  return (
    <div className="provider-card" onClick={() => navigate(`/providers/${provider._id}`)}>
      <div className="provider-card-img">
        {provider.logo ? (
          <img src={provider.logo} alt={provider.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span>{categoryEmojis[provider.category] || '⛽'}</span>
        )}
      </div>

      <div className="provider-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <span className="provider-badge">{provider.category}</span>
          <div className="provider-rating">
            <FiStar size={13} fill="currentColor" />
            {provider.rating?.toFixed(1)} ({provider.totalReviews})
          </div>
        </div>

        <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
          {provider.name}
        </h5>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
          <FiMapPin size={12} />
          {provider.address?.city}, {provider.address?.state}
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {provider.description}
        </p>

        {/* Pricing */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {provider.pricing?.cylinder14kg > 0 && (
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 8, padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>14kg: </span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{provider.pricing.cylinder14kg}</span>
            </div>
          )}
          {provider.pricing?.cylinder5kg > 0 && (
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 8, padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>5kg: </span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{provider.pricing.cylinder5kg}</span>
            </div>
          )}
        </div>

        {/* Features */}
        {provider.features?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {provider.features.slice(0, 2).map(f => (
              <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--success)', fontSize: '0.75rem' }}>
                <FiCheckCircle size={11} />{f}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '0 1.25rem 1.25rem' }}>
        <button
          className="btn-primary-custom"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem' }}
          onClick={(e) => { e.stopPropagation(); navigate(`/providers/${provider._id}`); }}
        >
          View & Book Slot
        </button>
      </div>
    </div>
  );
}

export default ProviderCard;
