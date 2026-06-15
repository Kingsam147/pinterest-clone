import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boardsAPI } from '../services/api';

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const BoardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const MyBoardsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    boardsAPI.getBoardsByUser(user.id || user._id)
      .then(setBoards)
      .catch(() => setError('Failed to load boards'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#E60023' }}>{error}</div>;

  return (
    <div style={styles.page}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <ArrowLeftIcon />
        <span>Back</span>
      </button>

      <h1 style={styles.heading}>My Boards</h1>
      <p style={styles.subheading}>{boards.length} {boards.length === 1 ? 'board' : 'boards'}</p>

      {boards.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>You haven't created any boards yet.</p>
          <p style={styles.emptyHint}>Save a pin from the home feed to create your first board.</p>
          <button onClick={() => navigate('/home')} style={styles.browseButton}>
            Browse pins
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {boards.map((board) => {
            const previewPins = board.pins?.slice(0, 4) ?? [];
            return (
              <div
                key={board._id}
                style={styles.card}
                onClick={() => navigate(`/boards/${board._id}`)}
              >
                <div style={styles.previewGrid}>
                  {previewPins.length > 0 ? (
                    previewPins.map((pin, index) => {
                      const imageUrl = typeof pin === 'object' ? pin.imageUrl : null;
                      return imageUrl ? (
                        <img
                          key={index}
                          src={imageUrl}
                          alt=""
                          style={styles.previewImg}
                          onError={(e) => { e.target.onerror = null; e.target.style.backgroundColor = '#f0f0f0'; e.target.src = ''; }}
                        />
                      ) : (
                        <div key={index} style={styles.previewPlaceholder} />
                      );
                    })
                  ) : (
                    <div style={styles.emptyPreview}>
                      <BoardIcon />
                    </div>
                  )}
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{board.title}</h3>
                  {board.description && (
                    <p style={styles.cardDesc}>{board.description}</p>
                  )}
                  <p style={styles.pinCount}>
                    {board.pins?.length ?? 0} {(board.pins?.length ?? 0) === 1 ? 'pin' : 'pins'}
                  </p>
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
  heading: {
    fontSize: 28,
    fontWeight: 700,
    margin: '0 0 4px',
    color: '#111',
  },
  subheading: {
    fontSize: 14,
    color: '#aaa',
    margin: '0 0 1.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  card: {
    border: '1px solid #eee',
    borderRadius: 14,
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    transition: 'box-shadow 200ms',
    backgroundColor: '#fff',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  previewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  previewPlaceholder: {
    backgroundColor: '#ebebeb',
  },
  emptyPreview: {
    gridColumn: '1 / -1',
    gridRow: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  cardContent: {
    padding: '0.85rem 1rem',
  },
  cardTitle: {
    margin: '0 0 4px',
    fontSize: 16,
    fontWeight: 700,
    color: '#111',
  },
  cardDesc: {
    margin: '0 0 4px',
    fontSize: 13,
    color: '#777',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  pinCount: {
    margin: 0,
    fontSize: 13,
    color: '#aaa',
    fontWeight: 500,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: '1.5rem',
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

export default MyBoardsScreen;
