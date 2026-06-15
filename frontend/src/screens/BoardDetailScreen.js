import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boardsAPI } from '../services/api';

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const BoardDetailScreen = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    boardsAPI.getBoardById(boardId)
      .then(setBoard)
      .catch(() => setError('Board not found'))
      .finally(() => setLoading(false));
  }, [boardId, user, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#E60023' }}>{error}</div>;
  if (!board) return null;

  const pins = board.pins ?? [];

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <ArrowLeftIcon />
        <span>Back</span>
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>{board.title}</h1>
        {board.description && <p style={styles.description}>{board.description}</p>}
        <p style={styles.pinCount}>{pins.length} {pins.length === 1 ? 'pin' : 'pins'}</p>
      </div>

      {pins.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No pins in this board yet.</p>
          <button onClick={() => navigate('/home')} style={styles.browseButton}>
            Browse pins to save
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {pins.map((pin) => {
            if (typeof pin !== 'object' || !pin.title) return null;
            return (
              <div
                key={pin._id}
                style={styles.card}
                onClick={() => navigate(`/pin/${pin._id}`)}
              >
                <div style={styles.imageWrap}>
                  <img
                    src={pin.imageUrl}
                    alt={pin.title}
                    style={styles.cardImage}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/250x200'; }}
                  />
                </div>
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>{pin.title}</h4>
                  {pin.description && (
                    <p style={styles.cardDesc}>{pin.description}</p>
                  )}
                  {pin.user && (
                    <p style={styles.cardAuthor}>by {pin.user.username ?? pin.user}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    padding: '1rem',
    backgroundColor: '#fff',
    minHeight: '100vh',
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
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 6px',
    color: '#111',
  },
  description: {
    fontSize: 15,
    color: '#666',
    margin: '0 0 6px',
    lineHeight: 1.5,
  },
  pinCount: {
    fontSize: 14,
    color: '#aaa',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  card: {
    border: '1px solid #eee',
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
    backgroundColor: '#fff',
  },
  imageWrap: {
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    display: 'block',
  },
  cardContent: {
    padding: '0.75rem',
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: 15,
    fontWeight: 600,
    color: '#111',
  },
  cardDesc: {
    margin: '0 0 4px',
    color: '#666',
    fontSize: 13,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardAuthor: {
    margin: 0,
    fontSize: 12,
    color: '#aaa',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginBottom: '1rem',
  },
  browseButton: {
    padding: '10px 24px',
    backgroundColor: '#E60023',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default BoardDetailScreen;
