import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  FileText,
  Upload,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Trash2,
  Edit,
  Award,
  Users,
  Search,
} from 'lucide-react';

const Assignments = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // Student: Submit Assignment Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Faculty: Create Assignment Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('Distributed Systems');
  const [newDeadline, setNewDeadline] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Faculty: View Submissions Modal
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [gradingState, setGradingState] = useState({}); // { [submissionId]: { marks, feedback } }
  const [isGrading, setIsGrading] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      showToast('Failed to load assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Student handles submission
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      showToast('Please attach your submission document or archive', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('submissionFile', submissionFile);
      if (submissionNotes) formData.append('notes', submissionNotes);

      const res = await api.post(`/submissions/${activeAssignment._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast(res.data.message || 'Assignment submitted successfully!', 'success');
      setIsSubmitModalOpen(false);
      setSubmissionFile(null);
      setSubmissionNotes('');
      fetchAssignments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit assignment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Faculty creates new assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || !newDeadline) {
      showToast('Please fill in title, description, and deadline', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', newTitle.trim());
      formData.append('description', newDescription.trim());
      formData.append('subject', newSubject.trim());
      formData.append('deadline', newDeadline);
      formData.append('maxMarks', newMaxMarks);
      if (attachmentFile) formData.append('attachment', attachmentFile);

      await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Assignment created successfully!', 'success');
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewDeadline('');
      setAttachmentFile(null);
      fetchAssignments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create assignment', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Open submissions review modal for an assignment
  const handleOpenSubmissions = async (assignmentId) => {
    try {
      const res = await api.get(`/assignments/${assignmentId}`);
      if (res.data.success) {
        setViewingAssignment(res.data.assignment);
        // Initialize grading state
        const initialGrading = {};
        (res.data.assignment.submissions || []).forEach((sub) => {
          initialGrading[sub._id] = {
            marks: sub.marksObtained !== null ? sub.marksObtained : '',
            feedback: sub.feedback || '',
          };
        });
        setGradingState(initialGrading);
        setIsSubmissionsModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to load assignment submissions', 'error');
    }
  };

  // Grade a submission
  const handleSaveGrade = async (submissionId) => {
    const gradeData = gradingState[submissionId];
    if (gradeData?.marks === undefined || gradeData?.marks === '') {
      showToast('Please enter marks before saving', 'warning');
      return;
    }

    setIsGrading(true);
    try {
      const res = await api.put(`/submissions/${submissionId}/grade`, {
        marksObtained: Number(gradeData.marks),
        feedback: gradeData.feedback,
      });

      showToast('Grade and feedback saved!', 'success');
      // Refresh assignment submissions in modal
      if (viewingAssignment) {
        handleOpenSubmissions(viewingAssignment._id);
      }
      fetchAssignments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save grade', 'error');
    } finally {
      setIsGrading(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment and all submissions?')) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      showToast('Assignment removed successfully', 'success');
      fetchAssignments();
    } catch (err) {
      showToast('Failed to delete assignment', 'error');
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || a.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['All', ...new Set(assignments.map((a) => a.subject))];

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Academic Assignments</h1>
          <p>
            {role === 'student'
              ? 'Submit coursework, review deadlines, and check faculty evaluation feedback.'
              : 'Publish assignments, manage deadlines, and evaluate student submissions.'}
          </p>
        </div>

        {(role === 'faculty' || role === 'admin') && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={18}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '40px' }}
            placeholder="Search assignments by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '120px' }} />
          <div className="skeleton" style={{ height: '120px' }} />
          <div className="skeleton" style={{ height: '120px' }} />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments found"
          description="There are currently no assignments matching your selected filters."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredAssignments.map((assignment) => {
            const isOverdue = new Date(assignment.deadline) < new Date();
            const isSubmitted = assignment.isSubmitted;
            const isGraded = assignment.isGraded;
            const subData = assignment.submission;

            return (
              <div key={assignment._id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ flex: '1', minWidth: '280px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-info">{assignment.subject}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Max Marks: {assignment.maxMarks}
                      </span>
                      {assignment.attachmentUrl && (
                        <a
                          href={assignment.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.785rem',
                            color: 'var(--primary)',
                            fontWeight: 600,
                          }}
                        >
                          <Download size={14} />
                          <span>{assignment.attachmentName || 'Attachment'}</span>
                        </a>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                      {assignment.title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '16px' }}>
                      {assignment.description}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={16} style={{ color: isOverdue ? 'var(--danger)' : 'var(--warning)' }} />
                        <span>Deadline: {new Date(assignment.deadline).toLocaleString()}</span>
                      </span>
                      <span>Posted by: {assignment.createdBy?.name}</span>
                    </div>
                  </div>

                  {/* Role Specific Actions & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    {role === 'student' ? (
                      <>
                        {isGraded ? (
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                              Score: {subData.marksObtained} / {assignment.maxMarks}
                            </span>
                            {subData.feedback && (
                              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '240px' }}>
                                &ldquo;{subData.feedback}&rdquo;
                              </p>
                            )}
                          </div>
                        ) : isSubmitted ? (
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                              Submitted (Under Review)
                            </span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Submitted on {new Date(subData.submittedAt).toLocaleDateString()}
                            </div>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ marginTop: '8px' }}
                              onClick={() => {
                                setActiveAssignment(assignment);
                                setIsSubmitModalOpen(true);
                              }}
                            >
                              Re-upload Solution
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              setActiveAssignment(assignment);
                              setIsSubmitModalOpen(true);
                            }}
                          >
                            <Upload size={16} />
                            <span>Submit Solution</span>
                          </button>
                        )}
                      </>
                    ) : (
                      /* Faculty / Admin Controls */
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenSubmissions(assignment._id)}
                        >
                          <Users size={16} />
                          <span>View Submissions ({assignment.totalSubmissions || 0})</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          title="Delete Assignment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Student Submit Assignment */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={`Submit: ${activeAssignment?.title || 'Assignment'}`}
      >
        <form onSubmit={handleStudentSubmit}>
          <div style={{ marginBottom: '16px', background: 'var(--bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Subject: <strong>{activeAssignment?.subject}</strong> | Deadline: <strong>{activeAssignment && new Date(activeAssignment.deadline).toLocaleString()}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Solution File (PDF, Word, Code Zip)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setSubmissionFile(e.target.files[0])}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Submission Notes (Optional)</label>
            <textarea
              className="form-control"
              placeholder="Add any notes, assumptions, or run instructions for the evaluator..."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsSubmitModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Faculty Create Assignment */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Course Assignment"
        maxWidth="620px"
      >
        <form onSubmit={handleCreateAssignment}>
          <div className="form-group">
            <label className="form-label">Assignment Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Lab 05: Distributed File Systems"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Distributed Systems"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Submission Deadline</label>
              <input
                type="datetime-local"
                className="form-control"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Marks</label>
              <input
                type="number"
                className="form-control"
                value={newMaxMarks}
                onChange={(e) => setNewMaxMarks(e.target.value)}
                min={1}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description / Instructions</label>
            <textarea
              className="form-control"
              placeholder="Provide assignment context, objectives, and evaluation rubrics..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attach Problem Set Document (Optional)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setAttachmentFile(e.target.files[0])}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Faculty Review Submissions & Grade */}
      <Modal
        isOpen={isSubmissionsModalOpen}
        onClose={() => setIsSubmissionsModalOpen(false)}
        title={`Submissions: ${viewingAssignment?.title || ''}`}
        maxWidth="760px"
      >
        <div>
          <div style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Total Submissions: <strong>{(viewingAssignment?.submissions || []).length}</strong> | Max Marks: <strong>{viewingAssignment?.maxMarks}</strong>
          </div>

          {(viewingAssignment?.submissions || []).length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No submissions received yet"
              description="Students have not uploaded their solutions for this assignment yet."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(viewingAssignment?.submissions || []).map((sub) => {
                const gradeInfo = gradingState[sub._id] || { marks: '', feedback: '' };

                return (
                  <div
                    key={sub._id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {sub.student?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Roll: {sub.student?.rollNumber} • Submitted: {new Date(sub.submittedAt).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className={`badge ${sub.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>
                          {sub.status === 'graded' ? `Graded: ${sub.marksObtained}/${viewingAssignment.maxMarks}` : 'Pending Review'}
                        </span>
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          download
                        >
                          <Download size={14} />
                          <span>Download File</span>
                        </a>
                      </div>
                    </div>

                    {sub.notes && (
                      <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>
                        Student Notes: &ldquo;{sub.notes}&rdquo;
                      </div>
                    )}

                    {/* Grading Form Row */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                      <div style={{ width: '130px' }}>
                        <input
                          type="number"
                          className="form-control"
                          placeholder={`Marks / ${viewingAssignment.maxMarks}`}
                          value={gradeInfo.marks}
                          onChange={(e) =>
                            setGradingState((prev) => ({
                              ...prev,
                              [sub._id]: { ...prev[sub._id], marks: e.target.value },
                            }))
                          }
                          min={0}
                          max={viewingAssignment.maxMarks}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '200px' }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Feedback comments for student..."
                          value={gradeInfo.feedback}
                          onChange={(e) =>
                            setGradingState((prev) => ({
                              ...prev,
                              [sub._id]: { ...prev[sub._id], feedback: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={isGrading}
                        onClick={() => handleSaveGrade(sub._id)}
                      >
                        <Award size={15} />
                        <span>Save Grade</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Assignments;
