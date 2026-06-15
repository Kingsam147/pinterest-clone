import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pinsAPI, boardsAPI } from '../services/api';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pins, setPins] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  const [userBoards, setUserBoards] = useState([]);
  const [hoveredPinId, setHoveredPinId] = useState(null);
  const [openSaveMenuId, setOpenSaveMenuId] = useState(null);
  const [savedPinIds, setSavedPinIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchInitial = async () => {
      try {
        const [paginatedData, boards] = await Promise.all([
          pinsAPI.getAllPins(1, 20),
          boardsAPI.getBoardsByUser(user.id || user._id),
        ]);
        setPins(paginatedData.pins);
        setTotal(paginatedData.total);
        setHasMore(paginatedData.hasMore);
        setUserBoards(boards);
      } catch {
        setError('Failed to load pins');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [user, navigate]);

  useEffect(() => {
    if (!openSaveMenuId) return;
    const close = () => setOpenSaveMenuId(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [openSaveMenuId]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await pinsAPI.search(trimmed);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await pinsAPI.getAllPins(nextPage, 20);
      setPins((prev) => [...prev, ...data.pins]);
      setPage(nextPage);
      setHasMore(data.hasMore);
    } catch {
      // load more failed silently
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  const handleSave = useCallback(async (boardId, pinId) => {
    setOpenSaveMenuId(null);
    try {
      await boardsAPI.addPin(boardId, pinId);
      setSavedPinIds((prev) => new Set([...prev, pinId]));
    } catch {
      // save failed silently
    }
  }, []);

  const toggleSaveMenu = useCallback((pinId, event) => {
    event.stopPropagation();
    setOpenSaveMenuId((prev) => (prev === pinId ? null : pinId));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#E60023' }}>{error}</div>;

  const displayPins = searchResults !== null ? searchResults : pins;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <input
          type="text"
          placeholder="Search pins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={() => navigate('/profile')} style={styles.navButton}>Profile</button>
        <button onClick={() => navigate('/settings')} style={styles.navButton}>Settings</button>
      </div>

      {searching && (
        <p style={styles.searchingText}>Searching...</p>
      )}

      {!searchResults && total > 0 && (
        <p style={styles.paginationInfo}>Showing {pins.length} of {total} pins</p>
      )}

      <div style={styles.grid}>
        {displayPins.map((pin) => (
          <div
            key={pin._id}
            style={styles.card}
            onMouseEnter={() => setHoveredPinId(pin._id)}
            onMouseLeave={() => setHoveredPinId(null)}
          >
            <div style={styles.imageWrap}>
              <img
                src={pin.imageUrl}
                alt={pin.title}
                style={styles.cardImage}
                onClick={() => navigate(`/pin/${pin._id}`)}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/250x200'; }}
              />
              {user && (hoveredPinId === pin._id || openSaveMenuId === pin._id) && (
                <div style={styles.saveOverlay}>
                  <button
                    style={{
                      ...styles.saveButton,
                      backgroundColor: savedPinIds.has(pin._id) ? '#00a854' : '#E60023',
                    }}
                    onClick={(event) => toggleSaveMenu(pin._id, event)}
                  >
                    {savedPinIds.has(pin._id) ? 'Saved ✓' : 'Save'}
                  </button>
                  {openSaveMenuId === pin._id && (
                    <div style={styles.boardPicker} onClick={(e) => e.stopPropagation()}>
                      <p style={styles.boardPickerTitle}>Save to board</p>
                      {userBoards.length === 0 ? (
                        <p style={styles.noBoardsText}>Create a board first</p>
                      ) : (
                        userBoards.map((board) => (
                          <button
                            key={board._id}
                            style={styles.boardItem}
                            onClick={() => handleSave(board._id, pin._id)}
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

            <div style={styles.cardContent} onClick={() => navigate(`/pin/${pin._id}`)}>
              <h4 style={styles.cardTitle}>{pin.title}</h4>
              {pin.description && (
                <p style={styles.cardDesc}>{pin.description}</p>
              )}
              {pin.user && (
                <p style={styles.cardAuthor}>by {pin.user.username}</p>
              )}
            </div>
          </div>
        ))}

        {displayPins.length === 0 && !searching && (
          <p style={styles.emptyText}>
            {searchQuery ? 'No pins match your search.' : 'No pins yet. Create one!'}
          </p>
        )}
      </div>

      {!searchResults && hasMore && (
        <div style={styles.loadMoreWrap}>
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            style={{ ...styles.loadMoreButton, opacity: loadingMore ? 0.7 : 1 }}
          >
            {loadingMore ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}

      <button
        onClick={() => navigate('/create-pin')}
        style={styles.fab}
        aria-label="Create pin"
      >
        +
      </button>
    </div>
  );
};

const styles = {
  page: {
    padding: '1rem',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #ddd',
    paddingBottom: '0.75rem',
  },
  searchInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 20,
    border: '1px solid #ccc',
    fontSize: 14,
    outline: 'none',
  },
  navButton: {
    padding: '6px 14px',
    border: '1px solid #ddd',
    borderRadius: 20,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    transition: 'background-color 200ms',
    whiteSpace: 'nowrap',
  },
  searchingText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    margin: '0.5rem 0',
  },
  paginationInfo: {
    fontSize: 13,
    color: '#999',
    margin: '0 0 0.75rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  },
  card: {
    border: '1px solid #eee',
    borderRadius: 12,
    overflow: 'visible',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
    position: 'relative',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  imageWrap: {
    position: 'relative',
    borderRadius: '12px 12px 0 0',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    display: 'block',
  },
  saveOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },
  saveButton: {
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    transition: 'background-color 150ms',
    display: 'block',
  },
  boardPicker: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    minWidth: 180,
    zIndex: 30,
    overflow: 'hidden',
  },
  boardPickerTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '10px 12px 6px',
    margin: 0,
  },
  noBoardsText: {
    fontSize: 13,
    color: '#bbb',
    padding: '4px 12px 12px',
    margin: 0,
  },
  boardItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    fontSize: 14,
    cursor: 'pointer',
    color: '#222',
    transition: 'background-color 150ms',
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
  emptyText: {
    color: '#999',
    gridColumn: '1 / -1',
    textAlign: 'center',
    fontSize: 15,
    padding: '2rem 0',
  },
  loadMoreWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1.5rem 0',
  },
  loadMoreButton: {
    padding: '10px 32px',
    backgroundColor: '#E60023',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 200ms',
  },
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    backgroundColor: '#E60023',
    color: '#fff',
    width: 56,
    height: 56,
    borderRadius: '50%',
    fontSize: '1.5rem',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
};

export default HomeScreen;
