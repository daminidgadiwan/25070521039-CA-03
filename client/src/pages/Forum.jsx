import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Check,
  Award,
  Send,
  User,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

const Forum = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [doubts, setDoubts] = useState([]);
  const [subjects, setSubjects] = useState(['All']);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isSolvedFilter, setIsSolvedFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // New Question Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSubject, setNewSubject] = useState('Distributed Systems');
  const [newTags, setNewTags] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Thread Detail Modal State
  const [activeDoubt, setActiveDoubt] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchDoubts = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/doubts?subject=${encodeURIComponent(selectedSubject)}&isSolved=${isSolvedFilter}`
      );
      if (res.data.success) {
        setDoubts(res.data.doubts);
        if (res.data.subjects) {
          setSubjects(['All', ...res.data.subjects]);
        }
      }
    } catch (err) {
      showToast('Failed to load discussion forum', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [selectedSubject, isSolvedFilter]);

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      showToast('Title and description are required', 'warning');
      return;
    }

    setIsCreating(true);
    try {
      await api.post('/doubts', {
        title: newTitle.trim(),
        description: newDescription.trim(),
        subject: newSubject.trim(),
        tags: newTags,
      });

      showToast('Question posted to community forum!', 'success');
      setIsNewModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewTags('');
      fetchDoubts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post question', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpvoteDoubt = async (doubtId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.post(`/doubts/${doubtId}/upvote`);
      setDoubts((prev) =>
        prev.map((d) => {
          if (d._id === doubtId) {
            const hasUpvoted = d.upvotes?.includes(user?._id);
            const newUpvotes = hasUpvoted
              ? d.upvotes.filter((id) => id !== user?._id)
              : [...(d.upvotes || []), user?._id];
            return { ...d, upvotes: newUpvotes };
          }
          return d;
        })
      );

      if (activeDoubt && activeDoubt._id === doubtId) {
        const dRes = await api.get(`/doubts/${doubtId}`);
        if (dRes.data.success) setActiveDoubt(dRes.data.doubt);
      }
    } catch (err) {
      showToast('Could not register upvote', 'error');
    }
  };

  const openThread = async (doubtId) => {
    try {
      const res = await api.get(`/doubts/${doubtId}`);
      if (res.data.success) {
        setActiveDoubt(res.data.doubt);
        setIsDetailOpen(true);
      }
    } catch (err) {
      showToast('Failed to open question thread', 'error');
    }
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await api.post(`/doubts/${activeDoubt._id}/replies`, {
        content: replyContent.trim(),
      });

      showToast('Reply published!', 'success');
      setActiveDoubt(res.data.doubt);
      setReplyContent('');
      fetchDoubts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post answer', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleMarkSolved = async (replyId) => {
    try {
      const res = await api.put(`/doubts/${activeDoubt._id}/solve/${replyId}`);
      showToast(res.data.message || 'Status updated', 'success');
      setActiveDoubt(res.data.doubt);
      fetchDoubts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action forbidden', 'error');
    }
  };

  const handleUpvoteReply = async (replyId) => {
    try {
      await api.post(`/doubts/${activeDoubt._id}/replies/${replyId}/upvote`);
      const dRes = await api.get(`/doubts/${activeDoubt._id}`);
      if (dRes.data.success) setActiveDoubt(dRes.data.doubt);
    } catch (err) {
      showToast('Could not upvote reply', 'error');
    }
  };

  const filteredDoubts = doubts.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase()) ||
    d.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Doubt Discussion Forum</h1>
          <p>Peer-to-peer academic exchange, verified faculty responses, and community Q&A.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsNewModalOpen(true)}
        >
          <Plus size={18} />
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          marginBottom: '28px',
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
            placeholder="Search discussions by topic, tag, or keywords..."
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

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '150px' }}
          value={isSolvedFilter}
          onChange={(e) => setIsSolvedFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="true">Solved Only</option>
          <option value="false">Unsolved Only</option>
        </select>
      </div>

      {/* Doubts List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton" style={{ height: '120px' }} />
          <div className="skeleton" style={{ height: '120px' }} />
        </div>
      ) : filteredDoubts.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No discussions found"
          description="Be the first to post a question or doubt in this category!"
          action={
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsNewModalOpen(true)}
            >
              Ask a Question
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredDoubts.map((doubt) => {
            const hasUpvoted = doubt.upvotes?.includes(user?._id);

            return (
              <div
                key={doubt._id}
                className="card"
                onClick={() => openThread(doubt._id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start',
                  padding: '20px 24px',
                }}
              >
                {/* Upvote Button Pill */}
                <button
                  type="button"
                  onClick={(e) => handleUpvoteDoubt(doubt._id, e)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: hasUpvoted ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: hasUpvoted ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    color: hasUpvoted ? 'var(--primary)' : 'var(--text-secondary)',
                    minWidth: '52px',
                    transition: 'all var(--transition-fast)',
                  }}
                  title="Upvote this question"
                >
                  <ThumbsUp size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }}>
                    {doubt.upvotes?.length || 0}
                  </span>
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span className="badge badge-info">{doubt.subject}</span>
                    {doubt.isSolved && (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} />
                        <span>SOLVED</span>
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Asked by <strong>{doubt.author?.name}</strong> ({doubt.author?.role}) •{' '}
                      {new Date(doubt.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {doubt.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '12px' }}>
                    {doubt.description.slice(0, 150)}...
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(doubt.tags || []).map((tag) => (
                        <span key={tag} className="seat-pill" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <MessageSquare size={16} />
                      <span>{doubt.replies?.length || 0} answers</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Post Question */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Ask the Academic Community"
        maxWidth="640px"
      >
        <form onSubmit={handleCreateDoubt}>
          <div className="form-group">
            <label className="form-label">Question Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. How does Paxos differ from Raft in leader failure recovery?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Raft, Consensus, Networks"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Question Description</label>
            <textarea
              className="form-control"
              placeholder="Provide background context, what you have tried, and exact doubts..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Full Question Thread Detail & Answers */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={activeDoubt?.title || 'Doubt Thread'}
        maxWidth="760px"
      >
        {activeDoubt && (
          <div>
            {/* Question Header */}
            <div
              style={{
                padding: '20px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge badge-info">{activeDoubt.subject}</span>
                  {activeDoubt.isSolved && (
                    <span className="badge badge-success">
                      <CheckCircle2 size={13} /> SOLVED
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleUpvoteDoubt(activeDoubt._id)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    backgroundColor: activeDoubt.upvotes?.includes(user?._id)
                      ? 'var(--primary-light)'
                      : undefined,
                    color: activeDoubt.upvotes?.includes(user?._id)
                      ? 'var(--primary)'
                      : undefined,
                  }}
                >
                  <ThumbsUp size={14} />
                  <span>Upvote ({activeDoubt.upvotes?.length || 0})</span>
                </button>
              </div>

              <p style={{ color: 'var(--text-primary)', fontSize: '0.975rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
                {activeDoubt.description}
              </p>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Asked by <strong>{activeDoubt.author?.name}</strong> ({activeDoubt.author?.role}) on{' '}
                {new Date(activeDoubt.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Answers Section */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>
              Answers ({activeDoubt.replies?.length || 0})
            </h3>

            {(activeDoubt.replies || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No answers posted yet. Be the first to share an explanation!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {activeDoubt.replies.map((reply) => {
                  const isAuthorFaculty = reply.author?.role === 'faculty';
                  const canMarkSolved =
                    activeDoubt.author?._id === user?._id ||
                    user?.role === 'faculty' ||
                    user?.role === 'admin';

                  return (
                    <div
                      key={reply._id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: 'var(--radius-lg)',
                        border: reply.isAcceptedAnswer
                          ? '2px solid var(--success)'
                          : '1px solid var(--border-color)',
                        backgroundColor: reply.isAcceptedAnswer
                          ? 'var(--success-light)'
                          : 'var(--bg-card)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {reply.author?.name}
                          </span>
                          {isAuthorFaculty ? (
                            <span className="badge badge-faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Award size={13} />
                              <span>FACULTY VERIFIED</span>
                            </span>
                          ) : (
                            <span className="badge badge-student">Student</span>
                          )}
                          {reply.isAcceptedAnswer && (
                            <span className="badge badge-success" style={{ fontWeight: 800 }}>
                              ACCEPTED SOLUTION
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleUpvoteReply(reply._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            <ThumbsUp size={13} />
                            <span>{reply.upvotes?.length || 0}</span>
                          </button>

                          {canMarkSolved && (
                            <button
                              type="button"
                              onClick={() => handleMarkSolved(reply._id)}
                              className={`btn btn-sm ${
                                reply.isAcceptedAnswer ? 'btn-danger' : 'btn-success'
                              }`}
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              {reply.isAcceptedAnswer ? 'Unmark Solution' : 'Accept Solution'}
                            </button>
                          )}
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-primary)', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {reply.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Answer Form */}
            <form onSubmit={handleAddReply} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">
                  Your Answer / Explanation {role === 'faculty' && '(Verified Faculty Badge Applied)'}
                </label>
                <textarea
                  className="form-control"
                  placeholder="Provide clear steps, theoretical reasoning, or code examples..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingReply || !replyContent.trim()}
                >
                  <Send size={16} />
                  <span>{isSubmittingReply ? 'Posting...' : 'Post Your Answer'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Forum;
