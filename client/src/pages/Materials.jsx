import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  FolderDown,
  Upload,
  Plus,
  Download,
  Search,
  FileText,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

const Materials = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState(['All']);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('Distributed Systems');
  const [semester, setSemester] = useState('Semester 6');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/materials');
      if (res.data.success) {
        setMaterials(res.data.materials);
        setSubjects(['All', ...res.data.subjects]);
      }
    } catch (err) {
      showToast('Failed to load study materials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDownload = async (materialId, fileUrl, fileName) => {
    try {
      await api.get(`/materials/${materialId}/download`);
      // Trigger native download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Increment local count
      setMaterials((prev) =>
        prev.map((m) => (m._id === materialId ? { ...m, downloadCount: m.downloadCount + 1 } : m))
      );
    } catch (err) {
      showToast('Failed to start download', 'error');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload', 'warning');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subject.trim());
      formData.append('semester', semester);
      formData.append('department', department);
      formData.append('materialFile', file);

      await api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showToast('Study notes uploaded successfully!', 'success');
      setIsUploadOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchMaterials();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload notes', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Delete this study material permanently?')) return;
    try {
      await api.delete(`/materials/${materialId}`);
      showToast('Study material removed', 'success');
      fetchMaterials();
    } catch (err) {
      showToast('Failed to remove study material', 'error');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>Notes & Study Materials</h1>
          <p>Download verified lecture presentations, cheatsheets, and laboratory manuals.</p>
        </div>

        {(role === 'faculty' || role === 'admin') && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsUploadOpen(true)}
          >
            <Plus size={18} />
            <span>Upload Material</span>
          </button>
        )}
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
            placeholder="Search notes by title, topic, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '200px' }}
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

      {/* Materials Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div className="skeleton" style={{ height: '200px' }} />
          <div className="skeleton" style={{ height: '200px' }} />
          <div className="skeleton" style={{ height: '200px' }} />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          icon={FolderDown}
          title="No study materials found"
          description="There are currently no notes or slides uploaded under this subject filter."
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredMaterials.map((mat) => (
            <div key={mat._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-info">{mat.subject}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {mat.fileType || 'PDF'} • {(mat.fileSize ? (mat.fileSize / (1024 * 1024)).toFixed(2) : '1.2')} MB
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {mat.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  {mat.description || 'Verified course reference material and technical notes.'}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <span>By: {mat.uploadedBy?.name || 'Faculty'}</span>
                  <span>{mat.downloadCount} downloads</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => handleDownload(mat._id, mat.fileUrl, mat.fileName)}
                  >
                    <Download size={16} />
                    <span>Download Notes</span>
                  </button>

                  {(role === 'admin' || (role === 'faculty' && mat.uploadedBy?._id === user?._id)) && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(mat._id)}
                      title="Delete Material"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Notes & Study Material"
      >
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label className="form-label">Material Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Paxos & Raft Consensus Slides"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Distributed Systems"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                className="form-control"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Computer Science & Engineering">Computer Science</option>
                <option value="Data Science & Artificial Intelligence">Data Science & AI</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-control"
              placeholder="Provide chapter coverage or topic overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose File (PDF, Word, PPT, Code ZIP)</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Publish Study Material'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Materials;
