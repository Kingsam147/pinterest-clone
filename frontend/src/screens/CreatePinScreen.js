import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pinsAPI, boardsAPI } from '../services/api';

const CATEGORIES = [
  'Photography', 'Food', 'Travel', 'Tech', 'Fashion', 'Fitness',
  'Gardening', 'Automotive', 'Digital Nomad', 'Coffee', 'Art',
  'Music', 'Yoga', 'Architecture', 'Design', 'Lifestyle',
];

const CreatePinScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchBoards = async () => {
      try {
        const userBoards = await boardsAPI.getBoardsByUser(user.id || user._id);
        setBoards(userBoards);
      } catch {
        setError('Failed to load boards.');
      }
    };
    fetchBoards();
  }, [user, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.imageUrl || !formData.category) {
      setError('Title, image, and category are required.');
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button>
        <h2 style={styles.heading}>Create Pin</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={styles.fileInput} />
          {formData.imageUrl && (
            <img src={formData.imageUrl} alt="preview" style={styles.preview} />
          )}

          <label style={styles.label}>Title *</label>
          <input
            type="text"
            placeholder="Add a title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            style={styles.input}
          />

          <label style={styles.label}>Description</label>
          <textarea
            placeholder="Tell everyone what your pin is about"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            style={{ ...styles.input, resize: 'vertical' }}
          />

          <label style={styles.label}>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            style={styles.input}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label style={styles.label}>Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g. sunset, travel, nature"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            style={styles.input}
          />

          {boards.length > 0 && (
            <>
              <label style={styles.label}>Board (optional)</label>
              <select
                value={formData.boardId}
                onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
                style={styles.input}
              >
                <option value="">No board</option>
                {boards.map((board) => (
                  <option key={board._id} value={board._id}>{board.title}</option>
                ))}
              </select>
            </>
          )}

          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Creating...' : 'Create Pin'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
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
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    color: '#666',
    marginBottom: '1rem',
    padding: 0,
  },
  heading: {
    fontSize: 24,
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    marginBottom: '1rem',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 15,
    boxSizing: 'border-box',
  },
  fileInput: {
    marginBottom: '0.75rem',
    display: 'block',
  },
  preview: {
    width: '100%',
    maxHeight: 250,
    objectFit: 'cover',
    borderRadius: 8,
    marginBottom: '1rem',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#E60023',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: '#E60023',
    marginBottom: 12,
  },
};

export default CreatePinScreen;
