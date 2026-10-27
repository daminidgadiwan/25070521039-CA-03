import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import EmptyState from '../components/EmptyState';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Users,
  Filter,
} from 'lucide-react';

const Attendance = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  // Student State
  const [studentData, setStudentData] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);

  // Faculty State
  const [subject, setSubject] = useState('Distributed Systems');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 6');
  const [studentsList, setStudentsList] = useState([]);
  const [studentStatusMap, setStudentStatusMap] = useState({}); // { [studentId]: 'present' | 'absent' | 'late' }
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Student Attendance Dashboard
  useEffect(() => {
    if (role === 'student') {
      const fetchAttendance = async () => {
        try {
          setLoadingStudent(true);
          const res = await api.get('/attendance/student');
          if (res.data.success) {
            setStudentData(res.data);
          }
        } catch (err) {
          showToast('Failed to load attendance records', 'error');
        } finally {
          setLoadingStudent(false);
        }
      };
      fetchAttendance();
    }
  }, [role]);

  // Fetch Students for Faculty Attendance Marking
  useEffect(() => {
    if (role === 'faculty' || role === 'admin') {
      const fetchStudents = async () => {
        try {
          setLoadingStudents(true);
          const res = await api.get(`/attendance/students?department=${encodeURIComponent(department)}`);
          if (res.data.success) {
            setStudentsList(res.data.students);
            // Default all students to present
            const initialMap = {};
            res.data.students.forEach((s) => {
              initialMap[s._id] = 'present';
            });
            setStudentStatusMap(initialMap);
          }
        } catch (err) {
          showToast('Failed to load student list', 'error');
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [role, department]);

  // Faculty submits attendance records
  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (studentsList.length === 0) {
      showToast('No students available to mark', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const records = studentsList.map((s) => ({
        student: s._id,
        status: studentStatusMap[s._id] || 'present',
      }));

      await api.post('/attendance', {
        subject,
        date,
        department,
        semester,
        records,
      });

      showToast(`Attendance for ${subject} on ${date} saved successfully!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save attendance', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const markAll = (status) => {
    const updated = {};
    studentsList.forEach((s) => {
      updated[s._id] = status;
    });
    setStudentStatusMap(updated);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Attendance Management</h1>
          <p>
            {role === 'student'
              ? 'Subject-wise breakdown, attendance threshold indicators, and historical class logs.'
              : 'Record student attendance by subject and date with instantaneous sync.'}
          </p>
        </div>
      </div>

      {/* ========================================================
          STUDENT VIEW: Attendance Breakdown & Warning Banner
          ======================================================== */}
      {role === 'student' && (
        <>
          {loadingStudent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="skeleton" style={{ height: '140px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="skeleton" style={{ height: '180px' }} />
                <div className="skeleton" style={{ height: '180px' }} />
              </div>
            </div>
          ) : (
            <>
              {/* WARNING BANNER: Below 75% Requirement */}
              {studentData?.summary?.isBelow75 && (
                <div
                  style={{
                    backgroundColor: 'var(--danger-light)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 24px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    color: 'var(--danger)',
                    animation: 'pulseBorder 2.5s infinite',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--danger)',
                      color: '#ffffff',
                      padding: '12px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AlertTriangle size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '4px' }}>
                      ⚠️ Attendance Alert: You are below the 75% mandatory threshold!
                    </h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5, opacity: 0.95 }}>
                      Your current overall attendance is <strong>{studentData?.summary?.overallPercentage}%</strong>.
                      College policy mandates at least 75% to appear for university examinations.
                      Attend subsequent lectures to avoid debarment.
                    </p>
                  </div>
                </div>
              )}

              {/* Overall Summary KPI */}
              <div
                className="card"
                style={{
                  padding: '28px',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    OVERALL AGGREGATE
                  </div>
                  <div
                    style={{
                      fontSize: '3rem',
                      fontWeight: 800,
                      color: studentData?.summary?.isBelow75 ? 'var(--danger)' : 'var(--success)',
                      lineHeight: 1.1,
                      marginTop: '6px',
                    }}
                  >
                    {studentData?.summary?.overallPercentage}%
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                    Attended <strong>{studentData?.summary?.totalAttended}</strong> out of{' '}
                    <strong>{studentData?.summary?.totalClasses}</strong> registered classes
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      75%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Minimum</div>
                  </div>
                  <div style={{ width: '1px', height: '40px', backgroundColor: 'var(--border-color)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        color: studentData?.summary?.isBelow75 ? 'var(--danger)' : 'var(--success)',
                      }}
                    >
                      {studentData?.summary?.isBelow75 ? 'Critical' : 'Eligible'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exam Status</div>
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Cards */}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '18px' }}>
                Subject-Wise Breakdown
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginBottom: '40px',
                }}
              >
                {(studentData?.subjects || []).map((sub) => {
                  const isLow = sub.percentage < 75;

                  return (
                    <div key={sub.subject} className="card" style={{ padding: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <span className="badge badge-info" style={{ fontSize: '0.7rem', marginBottom: '6px' }}>
                            {sub.department}
                          </span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {sub.subject}
                          </h3>
                        </div>
                        <span
                          className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}
                          style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                        >
                          {sub.percentage}%
                        </span>
                      </div>

                      {/* Progress Bar with 75% marker */}
                      <div style={{ position: 'relative', marginTop: '16px', marginBottom: '14px' }}>
                        <div
                          style={{
                            width: '100%',
                            height: '10px',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '5px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, sub.percentage)}%`,
                              height: '100%',
                              backgroundColor: isLow ? 'var(--danger)' : 'var(--success)',
                              borderRadius: '5px',
                              transition: 'width 0.5s ease',
                            }}
                          />
                        </div>
                        {/* 75% threshold marker tick */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '75%',
                            top: '-3px',
                            bottom: '-3px',
                            width: '2px',
                            backgroundColor: '#0f172a',
                            opacity: 0.5,
                          }}
                          title="75% Mandatory Cutoff"
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span>Present: <strong>{sub.present}</strong></span>
                        <span>Late: <strong>{sub.late}</strong></span>
                        <span>Absent: <strong style={{ color: sub.absent > 0 ? 'var(--danger)' : undefined }}>{sub.absent}</strong></span>
                        <span>Total: <strong>{sub.total}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Class History Logs */}
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '18px' }}>
                Class Attendance Log History
              </h2>

              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(studentData?.history || []).map((h) => (
                      <tr key={h._id}>
                        <td>{new Date(h.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>{h.subject}</td>
                        <td>
                          <span
                            className={`badge ${
                              h.status === 'present'
                                ? 'badge-success'
                                : h.status === 'late'
                                ? 'badge-warning'
                                : 'badge-danger'
                            }`}
                          >
                            {h.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>
                          {h.remarks || 'Standard lecture session'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* ========================================================
          FACULTY & ADMIN VIEW: Mark Student Attendance
          ======================================================== */}
      {(role === 'faculty' || role === 'admin') && (
        <form onSubmit={handleSaveAttendance}>
          {/* Controls Bar */}
          <div
            className="card"
            style={{
              padding: '24px',
              marginBottom: '28px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px',
              alignItems: 'flex-end',
            }}
          >
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject</label>
              <select
                className="form-control"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="Distributed Systems">Distributed Systems</option>
                <option value="Database Systems">Database Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Class Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => markAll('present')}
                title="Mark all students as Present"
              >
                All Present
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => markAll('absent')}
                title="Mark all as Absent"
              >
                All Absent
              </button>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Enrolled Students ({studentsList.length})
              </h3>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving || studentsList.length === 0}
              >
                <Save size={18} />
                <span>{isSaving ? 'Saving...' : 'Submit Attendance'}</span>
              </button>
            </div>

            {loadingStudents ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading students roster...
              </div>
            ) : studentsList.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students found"
                description="No active students enrolled in this department."
              />
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th style={{ textAlign: 'center' }}>Present</th>
                      <th style={{ textAlign: 'center' }}>Late</th>
                      <th style={{ textAlign: 'center' }}>Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsList.map((st) => {
                      const currentStatus = studentStatusMap[st._id] || 'present';

                      return (
                        <tr key={st._id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                            {st.rollNumber || 'N/A'}
                          </td>
                          <td style={{ fontWeight: 600 }}>{st.name}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{st.department}</td>

                          {/* Present Toggle */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() =>
                                setStudentStatusMap((prev) => ({ ...prev, [st._id]: 'present' }))
                              }
                              className={`btn btn-sm ${
                                currentStatus === 'present' ? 'btn-success' : 'btn-secondary'
                              }`}
                            >
                              <CheckCircle2 size={16} />
                              <span>Present</span>
                            </button>
                          </td>

                          {/* Late Toggle */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() =>
                                setStudentStatusMap((prev) => ({ ...prev, [st._id]: 'late' }))
                              }
                              className={`btn btn-sm ${
                                currentStatus === 'late' ? 'btn-secondary' : 'btn-secondary'
                              }`}
                              style={{
                                backgroundColor: currentStatus === 'late' ? 'var(--warning)' : undefined,
                                color: currentStatus === 'late' ? '#ffffff' : undefined,
                              }}
                            >
                              <Clock size={16} />
                              <span>Late</span>
                            </button>
                          </td>

                          {/* Absent Toggle */}
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() =>
                                setStudentStatusMap((prev) => ({ ...prev, [st._id]: 'absent' }))
                              }
                              className={`btn btn-sm ${
                                currentStatus === 'absent' ? 'btn-danger' : 'btn-secondary'
                              }`}
                            >
                              <XCircle size={16} />
                              <span>Absent</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Attendance;
