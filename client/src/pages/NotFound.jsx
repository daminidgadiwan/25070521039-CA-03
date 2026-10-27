import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <GraduationCap size={40} />
      </div>

      <div
        style={{
          fontSize: '6rem',
          fontWeight: 900,
          lineHeight: 1,
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px',
          fontFamily: 'var(--font-mono)',
        }}
      >
        404
      </div>

      <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-primary)' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginBottom: '28px' }}>
        The campus link you followed might have expired, been archived, or moved to another section.
      </p>

      <div style={{ display: 'flex', gap: '14px' }}>
        <Link to="/dashboard" className="btn btn-primary">
          <Home size={18} />
          <span>Back to Dashboard</span>
        </Link>
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={18} />
          <span>Landing Page</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
