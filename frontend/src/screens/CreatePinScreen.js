import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pinsAPI, boardsAPI, uploadAPI } from '../services/api';

const CATEGORIES = [
  'Photography', 'Food', 'Travel', 'Tech', 'Fashion', 'Fitness',
  'Gardening', 'Automotive', 'Digital Nomad', 'Coffee', 'Art',
  'Music', 'Yoga', 'Architecture', 'Design', 'Lifestyle',
];

const UploadIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const CreatePinScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: '',
    tags: '',
    boardId: '',
  });
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    boardsAPI.getBoardsByUser(user.id || user._id)
      .then(setBoards)
      .catch(() => {});
  }, [user, navigate]);

  const uploadFile = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }
    setError('');
    setPreviewUrl(URL.createObjectURL(file));
    setUploadStatus('uploading');

    try {
      const { url } = await uploadAPI.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      setUploadStatus('done');
    } catch {
      setUploadStatus('error');
      setPreviewUrl('');
      setError('Upload failed. Please try again.');
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearImage = () => {
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setUploadStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.imageUrl) {
      setError('Please upload an image first.');
      return;
    }
    if (!formData.title || !formData.category) {
      setError('Title and category are required.');
      return;
    }

    setSubmitting(true);
    try {
      await pinsAPI.createPin({
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        category: formData.category,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        boardId: formData.boardId || undefined,
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to create pin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const isBlocked = submitting || uploadStatus === 'uploading';

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeftIcon />
          <span>Back</span>
        </button>

        <h2 style={styles.heading}>Create Pin</h2>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Upload Zone */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                ...styles.uploadZone,
                ...(isDragging ? styles.uploadZoneActive : {}),
              }}
            >
              <div style={styles.uploadIconWrap}>
                <UploadIcon />
              </div>
              <p style={styles.uploadPrimary}>Click to upload or drag and drop</p>
              <p style={styles.uploadSub}>JPG, PNG, WEBP, GIF — max 10MB</p>
            </div>
          ) : (
            <div style={styles.previewWrap}>
              <img src={previewUrl} alt="Pin preview" style={styles.previewImg} />
              <div style={styles.previewBar}>
                {uploadStatus === 'uploading' && (
                  <span style={styles.statusUploading}>Uploading…</span>
                )}
                {uploadStatus === 'done' && (
                  <span style={styles.statusDone}>
                    <CheckIcon />
                    Uploaded
                  </span>
                )}
                {uploadStatus === 'error' && (
                  <span style={styles.statusError}>Upload failed</span>
                )}
                <button type="button" onClick={clearImage} style={styles.changeBtn}>
                  Change image
                </button>
              </div>
            </div>
          )}

          <label style={styles.label}>Title *</label>
          <input
            type="text"
            placeholder="Add a title"
            value={formData.title}
            onChange={handleChange('title')}
            required
            style={styles.input}
          />

          <label style={styles.label}>Description</label>
          <textarea
            placeholder="Tell everyone what your pin is about"
            value={formData.description}
            onChange={handleChange('description')}
            rows={3}
            style={{ ...styles.input, resize: 'vertical' }}
          />

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Category *</label>
              <select
                value={formData.category}
                onChange={handleChange('category')}
                required
                style={styles.input}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {boards.length > 0 && (
              <div style={styles.col}>
                <label style={styles.label}>Board</label>
                <select
                  value={formData.boardId}
                  onChange={handleChange('boardId')}
                  style={styles.input}
                >
                  <option value="">No board</option>
                  {boards.map((board) => (
                    <option key={board._id} value={board._id}>{board.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <label style={styles.label}>Tags</label>
          <input
            type="text"
            placeholder="e.g. sunset, travel, nature"
            value={formData.tags}
            onChange={handleChange('tags')}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={isBlocked}
            style={{ ...styles.submitButton, opacity: isBlocked ? 0.65 : 1, cursor: isBlocked ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Creating…' : 'Create Pin'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '2rem',
    width: '100%',
    maxWidth: 600,
    height: 'fit-content',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    color: '#767676',
    marginBottom: '1.25rem',
    padding: 0,
    transition: 'color 200ms',
  },
  heading: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#111',
    margin: '0 0 1.5rem',
  },
  errorBanner: {
    backgroundColor: '#fff0f1',
    color: '#E60023',
    border: '1px solid #ffd0d5',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: '1.25rem',
    fontSize: 14,
    fontWeight: 500,
  },
  uploadZone: {
    border: '2px dashed #ddd',
    borderRadius: 12,
    padding: '3rem 1rem',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    transition: 'border-color 200ms, background-color 200ms',
    backgroundColor: '#fafafa',
  },
  uploadZoneActive: {
    borderColor: '#E60023',
    backgroundColor: '#fff5f5',
  },
  uploadIconWrap: {
    color: '#aaa',
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
  },
  uploadPrimary: {
    fontSize: 15,
    fontWeight: 600,
    color: '#333',
    margin: '0 0 4px',
  },
  uploadSub: {
    fontSize: 13,
    color: '#999',
    margin: 0,
  },
  previewWrap: {
    marginBottom: '1.5rem',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #eee',
  },
  previewImg: {
    width: '100%',
    maxHeight: 320,
    objectFit: 'cover',
    display: 'block',
  },
  previewBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.6rem 1rem',
    backgroundColor: '#f9f9f9',
    borderTop: '1px solid #eee',
  },
  statusUploading: {
    fontSize: 13,
    color: '#888',
  },
  statusDone: {
    fontSize: 13,
    color: '#1a8a4a',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontWeight: 600,
  },
  statusError: {
    fontSize: 13,
    color: '#E60023',
    fontWeight: 500,
  },
  changeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 13,
    color: '#E60023',
    cursor: 'pointer',
    fontWeight: 600,
    padding: 0,
    textDecoration: 'underline',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: '1.25rem',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 15,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 200ms',
    fontFamily: 'inherit',
  },
  row: {
    display: 'flex',
    gap: '1rem',
  },
  col: {
    flex: 1,
  },
  submitButton: {
    width: '100%',
    padding: '13px',
    backgroundColor: '#E60023',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 16,
    fontWeight: 700,
    transition: 'opacity 200ms',
    marginTop: '0.5rem',
    fontFamily: 'inherit',
  },
};

export default CreatePinScreen;
