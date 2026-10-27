import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  CalendarCheck,
  FileText,
  Calendar,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Ticket,
  Plus,
} from 'lucide-react';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton" style={{ height: '80px', width: '100%' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div className="skeleton" style={{ height: '140px' }} />
            <div className="skeleton" style={{ height: '140px' }} />
            <div className="skeleton" style={{ height: '140px' }} />
          </div>
          <div className="skeleton" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'var(--primary-gradient)',
          color: '#ffffff',
          marginBottom: '28px',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
          border: 'none',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.2)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '14px',
            }}
          >
            <Sparkles size={14} />
            <span>PORTAL OVERVIEW • {role?.toUpperCase()}</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Welcome back, {user?.name}!
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', lineHeight: 1.5 }}>
            {role === 'student'
              ? 'Stay on top of your attendance percentages, coursework deadlines, and reserve seats for upcoming campus events.'
              : role === 'faculty'
              ? 'Review pending student submissions, record subject attendance, and post announcements for your classes.'
              : 'Supervise university accounts, schedule campus events with interactive seat maps, and monitor platform health.'}
          </p>
        </div>
      </div>

      {/* STUDENT DASHBOARD VIEW */}
      {role === 'student' && (
        <>
          {/* Low Attendance Warning Alert (< 75%) */}
          {stats.isAttendanceLow && (
            <div
              style={{
                backgroundColor: 'var(--danger-light)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 24px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                color: 'var(--danger)',
                animation: 'pulseBorder 3s infinite',
              }}
            >
              <div
                style={{
                  background: 'var(--danger)',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                  Action Required: Overall Attendance Below 75% ({stats.overallAttendance}%)
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '2px' }}>
                  University regulations require a minimum 75% attendance to qualify for mid-term & final examinations.
                  Please consult your course coordinator.
                </div>
              </div>
              <Link to="/attendance" className="btn btn-danger btn-sm">
                View Subject Details
              </Link>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {/* Attendance Meter */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  ATTENDANCE RECORD
                </span>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: stats.isAttendanceLow ? 'var(--danger-light)' : 'var(--success-light)',
                    color: stats.isAttendanceLow ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  <CalendarCheck size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: stats.isAttendanceLow ? 'var(--danger)' : 'var(--success)' }}>
                {stats.overallAttendance}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stats.totalAttended} of {stats.totalClasses} classes attended
              </div>
              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '3px',
                  marginTop: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, stats.overallAttendance)}%`,
                    height: '100%',
                    backgroundColor: stats.isAttendanceLow ? 'var(--danger)' : 'var(--success)',
                  }}
                />
              </div>
            </div>

            {/* Pending Assignments */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  PENDING ASSIGNMENTS
                </span>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--warning-light)',
                    color: 'var(--warning)',
                  }}
                >
                  <FileText size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.pendingAssignmentsCount || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stats.submittedAssignmentsCount || 0} completed submissions
              </div>
              <Link to="/assignments" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, marginTop: '12px' }}>
                <span>Submit assignments</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Bookings */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  EVENT PASSES
                </span>
                <div
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  <Ticket size={20} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {stats.myBookingsCount || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Active event registrations
              </div>
              <Link to="/my-bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, marginTop: '12px' }}>
                <span>View QR tickets</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Two-Column Content: Upcoming Events & Latest Announcements */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Upcoming Events */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Upcoming Campus Events</h3>
                </div>
                <Link to="/events" className="btn btn-secondary btn-sm">
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(data?.upcomingEvents || []).map((evt) => (
                  <div
                    key={evt._id}
                    style={{
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'center',
                      padding: '12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <img
                      src={evt.bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200'}
                      alt={evt.title}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                          {evt.category}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(evt.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {evt.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {evt.venue}
                      </div>
                    </div>
                    <Link to={`/events/${evt._id}/seats`} className="btn btn-primary btn-sm">
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Announcements */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} style={{ color: 'var(--warning)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Official Notices</h3>
                </div>
                <Link to="/announcements" className="btn btn-secondary btn-sm">
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(data?.latestAnnouncements || []).map((ann) => (
                  <div
                    key={ann._id}
                    style={{
                      padding: '14px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        {ann.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                      {ann.title}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {ann.content.slice(0, 110)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* FACULTY DASHBOARD VIEW */}
      {role === 'faculty' && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                ASSIGNMENTS POSTED
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>
                {stats.myAssignments || 0}
              </div>
              <Link to="/assignments" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                Create or manage &rarr;
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                SUBMISSIONS TO GRADE
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--warning)' }}>
                {stats.submissionsToGrade || 0}
              </div>
              <Link to="/assignments" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                Review now &rarr;
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                STUDY MATERIALS
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>
                {stats.myMaterials || 0}
              </div>
              <Link to="/materials" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                Upload notes &rarr;
              </Link>
            </div>

            <div className="card">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                DEPARTMENT STUDENTS
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--primary)' }}>
                {stats.totalStudents || 0}
              </div>
              <Link to="/attendance" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                Mark attendance &rarr;
              </Link>
            </div>
          </div>

          {/* Recent Submissions awaiting grading */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Student Submissions</h3>
              <Link to="/assignments" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assignment</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentSubmissions || []).map((sub) => (
                    <tr key={sub._id}>
                      <td style={{ fontWeight: 600 }}>{sub.student?.name}</td>
                      <td>{sub.assignment?.title}</td>
                      <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${sub.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <Link to="/assignments" className="btn btn-secondary btn-sm">
                          Grade
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentSubmissions || data?.recentSubmissions.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No pending submissions awaiting evaluation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ADMIN DASHBOARD VIEW */}
      {role === 'admin' && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            <div className="card">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                TOTAL STUDENTS
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--primary)' }}>
                {stats.totalStudents || 0}
              </div>
              <Link to="/admin" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                Manage users &rarr;
              </Link>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                TOTAL FACULTY
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--success)' }}>
                {stats.totalFaculty || 0}
              </div>
              <Link to="/admin" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                View directory &rarr;
              </Link>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                CAMPUS EVENTS
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px' }}>
                {stats.totalEvents || 0}
              </div>
              <Link to="/events" style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>
                Create event &rarr;
              </Link>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                SEAT BOOKINGS
              </span>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--warning)' }}>
                {stats.totalBookings || 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Revenue: ₹{stats.totalRevenue || 0}
              </div>
            </div>
          </div>

          {/* Recent Platform Bookings */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Campus Event Bookings</h3>
              <Link to="/events" className="btn btn-secondary btn-sm">
                Manage Events
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Attendee</th>
                    <th>Event</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentBookings || []).map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{b.bookingId}</td>
                      <td>{b.user?.name}</td>
                      <td>{b.event?.title}</td>
                      <td>
                        {b.seats?.map((s) => (
                          <span key={s} className="seat-pill" style={{ marginRight: '4px' }}>
                            {s}
                          </span>
                        ))}
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{b.totalAmount}</td>
                      <td>{new Date(b.bookedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
