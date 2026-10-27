import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Briefcase,
  Hash,
  Sparkles,
} from 'lucide-react';

const Signup = () => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [rollNumber, setRollNumber] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department,
        rollNumber: role === 'student' ? rollNumber.trim() : undefined,
        employeeId: role === 'faculty' ? employeeId.trim() : undefined,
      };

      const res = await signup(payload);
      showToast(`Account created successfully! Welcome, ${res.user.name}.`, 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check the details.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Left Visual Column */}
      <div
        style={{
          flex: '1',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
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

        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
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
            }}
          >
            <Sparkles size={14} style={{ color: '#818cf8' }} />
            <span>Join 2,500+ Campus Community Members</span>
          </div>

          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '18px', color: '#ffffff' }}>
            Empower your university journey.
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Seamlessly submit assignments, monitor attendance percentages, clear doubts with professors,
            and book fest seats before they run out.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 10, fontSize: '0.8rem', color: '#94a3b8' }}>
          Note: Administrator accounts are seeded by campus IT operations and cannot be self-registered.
        </div>
      </div>

      {/* Right Form Column */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          maxWidth: '580px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '8px' }}>
              Create an account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
              Select your role and enter your institutional details
            </p>
          </div>

          {/* Role Selector Tabs (Student / Faculty) */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '24px',
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              type="button"
              onClick={() => setRole('student')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.9rem',
                backgroundColor: role === 'student' ? 'var(--bg-card)' : 'transparent',
                color: role === 'student' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: role === 'student' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '0.9rem',
                backgroundColor: role === 'faculty' ? 'var(--bg-card)' : 'transparent',
                color: role === 'faculty' ? 'var(--primary)' : 'var(--text-secondary)',
                boxShadow: role === 'faculty' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              👨‍🏫 Faculty Member
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name-input">
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="name-input"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">
                Institutional Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="signup-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder={role === 'student' ? 'student@campusconnect.edu' : 'faculty@campusconnect.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Roll Number or Employee ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="id-input">
                {role === 'student' ? 'Student Roll Number' : 'Faculty Employee ID'}
              </label>
              <div style={{ position: 'relative' }}>
                <Hash
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="id-input"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder={role === 'student' ? 'e.g. CS202401' : 'e.g. FAC-CSE-202'}
                  value={role === 'student' ? rollNumber : employeeId}
                  onChange={(e) =>
                    role === 'student' ? setRollNumber(e.target.value) : setEmployeeId(e.target.value)
                  }
                />
              </div>
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="department-select">
                Academic Department
              </label>
              <select
                id="department-select"
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Data Science & Artificial Intelligence">Data Science & Artificial Intelligence</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="signup-pass">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="signup-pass"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', padding: '4px' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-pass">
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  id="confirm-pass"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Re-type password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Register as {role === 'student' ? 'Student' : 'Faculty'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '24px',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
