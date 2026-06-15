import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pinsAPI, commentsAPI, boardsAPI } from '../services/api';

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

  const [userBoards, setUserBoards] = useState([]);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetches = [pinsAPI.getPinById(pinId), commentsAPI.getByPin(pinId)];
        if (user) {
          fetches.push(boardsAPI.getBoardsByUser(user.id || user._id));
        }
        const results = await Promise.all(fetches);
        setPin(results[0]);
        setComments(results[1]);
        if (user) setUserBoards(results[2]);
      } catch {
        setError('Pin not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pinId, user]);

  useEffect(() => {
    if (!saveMenuOpen) return;
    const close = () => setSaveMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [saveMenuOpen]);

  const handleSave = useCallback(async (boardId) => {
    setSaveMenuOpen(false);
    setSaveStatus('saving');
    try {
      await boardsAPI.addPin(boardId, pinId);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('idle');
    }
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
      // comment failed silently
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#E60023' }}>{error}</div>;
  if (!pin) return null;

  const saveLabel = saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'saving' ? 'Saving...' : 'Save';
  const saveColor = saveStatus === 'saved' ? '#00a854' : '#E60023';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>← Back</button>

      <img
        src={pin.imageUrl}
        alt={pin.title}
        style={{ width: '100%', maxHeight: '60vh', objectFit: 'cover', borderRadius: 12 }}
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/600x400'; }}
      />

      <div style={styles.titleRow}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>{pin.title}</h1>
          {pin.description && <p style={styles.description}>{pin.description}</p>}
        </div>

        {user && (
          <div style={styles.saveWrap} onClick={(e) => e.stopPropagation()}>
            <button
              style={{ ...styles.saveButton, backgroundColor: saveColor }}
              onClick={() => setSaveMenuOpen((prev) => !prev)}
              disabled={saveStatus === 'saving'}
            >
              {saveLabel}
            </button>
            {saveMenuOpen && (
              <div style={styles.boardPicker}>
                <p style={styles.boardPickerTitle}>Save to board</p>
                {userBoards.length === 0 ? (
                  <p style={styles.noBoardsText}>Create a board first</p>
                ) : (
                  userBoards.map((board) => (
                    <button
                      key={board._id}
                      style={styles.boardItem}
                      onClick={() => handleSave(board._id)}
                    >
                      {board.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {pin.user && (
        <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>
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
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '1rem',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: '#111',
  },
  description: {
    margin: '6px 0 0',
    color: '#555',
    fontSize: 15,
    lineHeight: 1.5,
  },
  saveWrap: {
    position: 'relative',
    flexShrink: 0,
  },
  saveButton: {
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    padding: '10px 24px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 150ms',
    whiteSpace: 'nowrap',
  },
  boardPicker: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    minWidth: 200,
    zIndex: 50,
    overflow: 'hidden',
  },
  boardPickerTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '10px 14px 6px',
    margin: 0,
  },
  noBoardsText: {
    fontSize: 13,
    color: '#bbb',
    padding: '4px 14px 14px',
    margin: 0,
  },
  boardItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '9px 14px',
    fontSize: 14,
    cursor: 'pointer',
    color: '#222',
    transition: 'background-color 150ms',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#f0f0f0',
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 13,
    color: '#333',
    marginTop: 8,
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
    fontFamily: 'inherit',
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
