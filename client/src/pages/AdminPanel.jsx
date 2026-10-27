import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import EmptyState from '../components/EmptyState';
import {
  ShieldAlert,
  Users,
  Search,
  CheckCircle,
  Ban,
  Trash2,
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
} from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/users?role=${roleFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      showToast('Failed to load user records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'blocked' ? 'active' : 'blocked';
    setUpdatingId(targetUser._id);
    try {
      const res = await api.put(`/users/${targetUser._id}/status`, { status: nextStatus });
      showToast(res.data.message || `Status updated to ${nextStatus}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, status: nextStatus } : u))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update user status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeRole = async (targetUser, newRole) => {
    setUpdatingId(targetUser._id);
    try {
      const res = await api.put(`/users/${targetUser._id}/role`, { role: newRole });
      showToast(res.data.message || `Role updated to ${newRole}`, 'success');
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not update user role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) return;

    setUpdatingId(targetUserId);
    try {
      await api.delete(`/users/${targetUserId}`);
      showToast('User deleted from system', 'success');
      setUsers((prev) => prev.filter((u) => u._id !== targetUserId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not delete user', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Administrator Management Console</h1>
          <p>Institutional oversight, role permissions, user access moderation, and directory management.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/events" className="btn btn-primary btn-sm">
            <Calendar size={16} />
            <span>Manage Events</span>
          </Link>
          <Link to="/announcements" className="btn btn-secondary btn-sm">
            <ShieldAlert size={16} />
            <span>Manage Circulars</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '40px' }}
            placeholder="Search users by name, email, roll number, or employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') fetchUsers();
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admins</option>
          </select>

          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>

          <button type="button" onClick={fetchUsers} className="btn btn-secondary">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            Registered University Accounts ({users.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading user directory...
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No matching users found"
            description="Adjust your search query or filters to find university accounts."
          />
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>ID / Roll</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u._id === user?._id;
                  const isBlocked = u.status === 'blocked';

                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary-light)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: 'var(--primary)',
                            }}
                          >
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>
                              {u.name} {isMe && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(You)</span>}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role.toUpperCase()}</span>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {u.rollNumber || u.employeeId || '—'}
                      </td>

                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {u.department}
                      </td>

                      <td>
                        <span className={`badge ${isBlocked ? 'badge-danger' : 'badge-success'}`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        {!isMe ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {/* Toggle Block / Active */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              disabled={updatingId === u._id}
                              className={`btn btn-sm ${isBlocked ? 'btn-success' : 'btn-outline-danger'}`}
                              title={isBlocked ? 'Unblock user' : 'Block user'}
                            >
                              {isBlocked ? <UserCheck size={14} /> : <Ban size={14} />}
                              <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                            </button>

                            {/* Role Switcher */}
                            {u.role === 'student' ? (
                              <button
                                type="button"
                                onClick={() => handleChangeRole(u, 'faculty')}
                                disabled={updatingId === u._id}
                                className="btn btn-secondary btn-sm"
                                title="Promote to Faculty"
                              >
                                <span>Make Faculty</span>
                              </button>
                            ) : u.role === 'faculty' ? (
                              <button
                                type="button"
                                onClick={() => handleChangeRole(u, 'student')}
                                disabled={updatingId === u._id}
                                className="btn btn-secondary btn-sm"
                                title="Change to Student"
                              >
                                <span>Make Student</span>
                              </button>
                            ) : null}

                            {/* Delete User */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={updatingId === u._id}
                              className="btn btn-outline-danger btn-sm"
                              title="Delete User Permanently"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Root</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
