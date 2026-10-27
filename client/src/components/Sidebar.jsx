import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  CalendarCheck,
  FolderDown,
  MessageSquare,
  Ticket,
  Calendar,
  ShieldAlert,
  User,
  X,
  GraduationCap,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();

  const getNavItems = () => {
    // Base items
    const items = [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
    ];

    if (role === 'student') {
      items.push(
        {
          to: '/assignments',
          label: 'Assignments',
          icon: FileText,
        },
        {
          to: '/attendance',
          label: 'Attendance',
          icon: CalendarCheck,
        },
        {
          to: '/materials',
          label: 'Study Notes',
          icon: FolderDown,
        },
        {
          to: '/forum',
          label: 'Doubt Forum',
          icon: MessageSquare,
        },
        {
          to: '/events',
          label: 'College Events',
          icon: Calendar,
        },
        {
          to: '/my-bookings',
          label: 'My Bookings',
          icon: Ticket,
        }
      );
    } else if (role === 'faculty') {
      items.push(
        {
          to: '/assignments',
          label: 'Assignments',
          icon: FileText,
        },
        {
          to: '/attendance',
          label: 'Mark Attendance',
          icon: CalendarCheck,
        },
        {
          to: '/materials',
          label: 'Study Materials',
          icon: FolderDown,
        },
        {
          to: '/announcements',
          label: 'Announcements',
          icon: ShieldAlert,
        },
        {
          to: '/forum',
          label: 'Doubt Forum',
          icon: MessageSquare,
        },
        {
          to: '/events',
          label: 'Events & Shows',
          icon: Calendar,
        }
      );
    } else if (role === 'admin') {
      items.push(
        {
          to: '/admin',
          label: 'Admin Operations',
          icon: ShieldAlert,
        },
        {
          to: '/assignments',
          label: 'Assignments',
          icon: FileText,
        },
        {
          to: '/attendance',
          label: 'Attendance',
          icon: CalendarCheck,
        },
        {
          to: '/materials',
          label: 'Study Materials',
          icon: FolderDown,
        },
        {
          to: '/events',
          label: 'Events & Layouts',
          icon: Calendar,
        },
        {
          to: '/announcements',
          label: 'Announcements',
          icon: ShieldAlert,
        },
        {
          to: '/forum',
          label: 'Community Forum',
          icon: MessageSquare,
        }
      );
    }

    // Common item for all roles
    items.push({
      to: '/profile',
      label: 'My Profile',
      icon: User,
    });

    return items;
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-overlay)',
            zIndex: 90,
          }}
          className="d-lg-none"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border-color)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)',
        }}
        className={isOpen ? 'sidebar-open' : 'sidebar-responsive'}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: 'var(--navbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.35)',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                Campus<span style={{ color: 'var(--primary)' }}>Connect</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Portal & Community
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="modal-close d-lg-none"
            style={{ width: '28px', height: '28px' }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div
          style={{
            padding: '18px 20px',
            margin: '16px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--border-color)',
              flexShrink: 0,
            }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={20} style={{ color: 'var(--primary)' }} />
            )}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Account'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {user?.rollNumber || user?.employeeId || user?.department?.slice(0, 18) || 'Online'}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  if (window.innerWidth < 992) onClose();
                }}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none',
                  transition: 'all var(--transition-fast)',
                })}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
          }}
        >
          CampusConnect v1.0.0
        </div>
      </aside>

      <style>{`
        @media (max-width: 992px) {
          .sidebar-responsive {
            transform: translateX(-100%);
          }
          .sidebar-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
