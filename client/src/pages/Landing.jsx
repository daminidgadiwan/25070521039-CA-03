import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  CalendarCheck,
  Ticket,
  MessageSquare,
  FolderDown,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
} from 'lucide-react';

const Landing = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password) => {
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card-glass)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
            }}
          >
            <GraduationCap size={24} />
          </div>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            Campus<span style={{ color: 'var(--primary)' }}>Connect</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              <span>Go to Dashboard</span>
              <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Create Account
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '80px 24px 60px',
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '24px',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <Sparkles size={16} />
          <span>Unified Campus Portal & Real-Time Event Booking</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '20px',
            color: 'var(--text-primary)',
          }}
        >
          Everything Campus,{' '}
          <span
            style={{
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Connected in Real Time.
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          From student attendance tracking with mandatory 75% alerts and digital assignment submissions to
          community doubt forums and BookMyShow-style live seat reservations.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn btn-primary btn-lg">
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/events" className="btn btn-secondary btn-lg">
            <Ticket size={18} />
            <span>Browse Campus Events</span>
          </Link>
        </div>

        {/* 1-Click Demo Login Box */}
        <div
          style={{
            marginTop: '50px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Instant Demo Access (Click to Test Any Role)
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Student 1 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('aarav.sharma@student.campusconnect.edu', 'Student@123')}
              className="card"
              style={{
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                borderColor: 'rgba(99, 102, 241, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-student">Student</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>88% Attendance</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Aarav Sharma</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>aarav.sharma@...edu</div>
            </button>

            {/* Student 2 (Low Attendance Warning) */}
            <button
              type="button"
              onClick={() => handleQuickLogin('priya.verma@student.campusconnect.edu', 'Student@123')}
              className="card"
              style={{
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                borderColor: 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-student">Student</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 600 }}>68% &lt;75% Warning</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Priya Verma</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>priya.verma@...edu</div>
            </button>

            {/* Faculty */}
            <button
              type="button"
              onClick={() => handleQuickLogin('prof.sharma@campusconnect.edu', 'Faculty@123')}
              className="card"
              style={{
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                borderColor: 'rgba(16, 185, 129, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-faculty">Faculty</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CSE Head</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Prof. Rajesh Sharma</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>prof.sharma@...edu</div>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@campusconnect.edu', 'Admin@123')}
              className="card"
              style={{
                padding: '16px',
                textAlign: 'left',
                cursor: 'pointer',
                borderColor: 'rgba(244, 63, 94, 0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="badge badge-admin">Admin</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full System</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>System Administrator</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>admin@...edu</div>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section
        style={{
          padding: '60px 24px 100px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
            Built for Modern Campus Life
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            One single, synchronized platform for academics, administrative workflows, and campus culture.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Feature 1 */}
          <div className="card">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <Ticket size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
              BookMyShow-Style Real-Time Booking
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5 }}>
              Auditorium seat grids (Rows A-J), instant Socket.IO multi-tab sync, 5-minute seat locks,
              atomic MongoDB double-booking prevention, and instant digital tickets with QR codes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <CalendarCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
              Attendance Tracker & 75% Guard
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5 }}>
              Subject-wise percentages, progress bars, automated alerts if below the 75% threshold,
              and simple 1-click batch marking for faculty.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
              }}
            >
              <MessageSquare size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
              Interactive Doubt Forum
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5 }}>
              Ask questions with subject tags, upvote helpful community answers, receive verified faculty
              responses, and mark doubts as officially solved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
