import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pinsAPI, commentsAPI } from '../services/api';

const PinDetailScreen = () => {
  const { pinId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pin, setPin] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const [pinData, commentsData] = await Promise.all([
          pinsAPI.getPinById(pinId),
          commentsAPI.getByPin(pinId),
        ]);
        setPin(pinData);
        setComments(commentsData);
      } catch {
        setError('Pin not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPin();
  }, [pinId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setCommentLoading(true);
    try {
      const comment = await commentsAPI.create(pinId, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch {
      // comment failed silently — could surface an error state here
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#E60023' }}>{error}</div>;
  if (!pin) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button>

      <img
        src={pin.imageUrl}
        alt={pin.title}
        style={{ width: '100%', maxHeight: '60vh', objectFit: 'cover', borderRadius: 12 }}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400'; }}
      />

      <h1 style={{ marginTop: '1rem' }}>{pin.title}</h1>
      <p style={{ color: '#555' }}>{pin.description}</p>

      {pin.user && (
        <p style={{ color: '#888', fontSize: 14 }}>
          By <strong>{pin.user.username}</strong>
        </p>
      )}

      {pin.category && (
        <span style={styles.badge}>{pin.category}</span>
      )}

      {pin.tags?.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          {pin.tags.map((tag) => (
            <span key={tag} style={styles.tag}>#{tag}</span>
          ))}
        </div>
      )}

      <hr style={{ margin: '1.5rem 0' }} />

      <h3>Comments ({comments.length})</h3>

      {comments.map((comment) => (
        <div key={comment._id} style={styles.comment}>
          <strong>{comment.user?.username ?? 'Unknown'}</strong>
          <span style={{ marginLeft: 8 }}>{comment.text}</span>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
      ))}

      {user && (
        <div style={{ marginTop: '1rem' }}>
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            style={styles.textarea}
          />
          <button
            onClick={handleAddComment}
            disabled={commentLoading || !newComment.trim()}
            style={styles.commentButton}
          >
            {commentLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    color: '#666',
    marginBottom: '1rem',
    padding: 0,
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 13,
    color: '#333',
  },
  tag: {
    display: 'inline-block',
    marginRight: 8,
    padding: '3px 8px',
    backgroundColor: '#eee',
    borderRadius: 4,
    fontSize: 13,
    color: '#555',
  },
  comment: {
    padding: '0.75rem 0',
    borderBottom: '1px solid #f0f0f0',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  commentButton: {
    marginTop: '0.5rem',
    padding: '8px 20px',
    backgroundColor: '#E60023',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default PinDetailScreen;
