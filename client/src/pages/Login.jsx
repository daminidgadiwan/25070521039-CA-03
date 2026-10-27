import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Ticket,
  CalendarCheck,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await login(email.trim(), password);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Left Column: Visual Showcase Gradient Panel */}
      <div
        style={{
          flex: '1',
          background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f172a 100%)',
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="d-lg-flex"
      >
        {/* Ambient Glowing Blobs */}
        <div
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, rgba(99, 102, 241, 0) 70%)',
            top: '-50px',
            left: '-50px',
            filter: 'blur(30px)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              }}
            >
              <GraduationCap size={24} />
            </div>
            <span>
              Campus<span style={{ color: '#818cf8' }}>Connect</span>
            </span>
          </Link>
        </div>

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '520px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <Sparkles size={14} style={{ color: '#818cf8' }} />
            <span>Academic Portal & Real-time Live Events</span>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '18px', color: '#ffffff' }}>
            Your entire campus, synchronized in real time.
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Access attendance metrics, submit coursework, join academic discussions, and book event seats with instant live updates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '0.95rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.25)', padding: '6px', borderRadius: '8px' }}>
                <Ticket size={18} style={{ color: '#818cf8' }} />
              </div>
              <span>BookMyShow-style interactive seat selection & live locks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '0.95rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.25)', padding: '6px', borderRadius: '8px' }}>
                <CalendarCheck size={18} style={{ color: '#34d399' }} />
              </div>
              <span>Attendance percentage calculation with 75% warning guard</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e2e8f0', fontSize: '0.95rem' }}>
              <div style={{ background: 'rgba(244, 63, 94, 0.25)', padding: '6px', borderRadius: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#fb7185' }} />
              </div>
              <span>Role-protected secure student, faculty, and admin routes</span>
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 10, fontSize: '0.8rem', color: '#94a3b8' }}>
          © 2026 CampusConnect Platform. All rights reserved.
        </div>
      </div>

      {/* Right Column: Clean Form Container */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          maxWidth: '560px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '8px' }}>
              Welcome back
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Sign in to access your CampusConnect dashboard
            </p>
          </div>

          {/* Quick Demo Fill Chips */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Quick Fill Demo Accounts:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => fillCredentials('admin@campusconnect.edu', 'Admin@123')}
                className="btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('prof.sharma@campusconnect.edu', 'Faculty@123')}
                className="btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('aarav.sharma@student.campusconnect.edu', 'Student@123')}
                className="btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Student 1 (Good Att.)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('priya.verma@student.campusconnect.edu', 'Student@123')}
                className="btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                Student 2 (&lt;75% Warning)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="email-input"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="name@campusconnect.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="password-input">
                  Password
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    padding: '4px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '28px',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            Don't have an account yet?{' '}
            <Link to="/signup" style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .d-lg-flex {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
