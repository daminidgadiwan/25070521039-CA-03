import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sun,
  Moon,
  Menu,
  Bell,
  LogOut,
  User,
  Ticket,
  ChevronDown,
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, role, theme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = () => {
    if (role === 'admin') return 'badge-admin';
    if (role === 'faculty') return 'badge-faculty';
    return 'badge-student';
  };

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="btn-secondary"
          style={{
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            CampusConnect
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span className={`badge ${getRoleBadgeClass()}`}>
            {role ? role.toUpperCase() : 'USER'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-secondary"
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={17} style={{ color: '#fbbf24' }} />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={17} style={{ color: '#6366f1' }} />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* User Profile Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--border-color)',
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || 'User'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={18} style={{ color: 'var(--primary)' }} />
              )}
            </div>
            <div style={{ display: 'none', flexDirection: 'column', textAlign: 'left' }} className="d-md-flex">
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {user?.name || 'User'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {user?.email}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="btn-secondary"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
            }}
            title="Sign out of CampusConnect"
          >
            <LogOut size={16} />
            <span style={{ fontWeight: 600 }}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
