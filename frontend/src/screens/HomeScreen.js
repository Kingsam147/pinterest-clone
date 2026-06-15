import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pinsAPI } from '../services/api';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchPins = async () => {
      try {
        const data = await pinsAPI.getAllPins();
        setPins(data);
      } catch {
        setError('Failed to load pins');
      } finally {
        setLoading(false);
      }
    };
    fetchPins();
  }, [user, navigate]);

  const filteredPins = pins.filter((pin) =>
    pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pin.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#E60023' }}>{error}</div>;

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid #ddd',
        paddingBottom: '0.5rem',
        gap: '1rem',
      }}>
        <input
          type="text"
          placeholder="Search pins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button onClick={() => navigate('/profile')} style={styles.navButton}>Profile</button>
        <button onClick={() => navigate('/settings')} style={styles.navButton}>Settings</button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
      }}>
        {filteredPins.map((pin) => (
          <div
            key={pin._id}
            onClick={() => navigate(`/pin/${pin._id}`)}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <img
              src={pin.imageUrl}
              alt={pin.title}
              style={{ width: '100%', height: 200, objectFit: 'cover' }}
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/250x200'; }}
            />
            <div style={{ padding: '0.75rem' }}>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>{pin.title}</h4>
              <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{pin.description}</p>
              {pin.user && (
                <p style={{ margin: '0.5rem 0 0', fontSize: 12, color: '#999' }}>
                  by {pin.user.username}
                </p>
              )}
            </div>
          </div>
        ))}
        {filteredPins.length === 0 && (
          <p style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center' }}>
            {searchQuery ? 'No pins match your search.' : 'No pins yet. Create one!'}
          </p>
        )}
      </div>

      <button
        onClick={() => navigate('/create-pin')}
        style={{
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
        }}
        aria-label="Create pin"
      >
        +
      </button>
    </div>
  );
};

const styles = {
  navButton: {
    padding: '6px 14px',
    border: '1px solid #ddd',
    borderRadius: 20,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
};

export default HomeScreen;
