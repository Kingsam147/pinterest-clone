import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pinsAPI } from '../services/api';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPins = async () => {
    try {
      setLoading(true);
      const response = await pinsAPI.getAllPins();
      setPins(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching pins:', err);
      setError('Failed to load pins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  const filteredPins = pins.filter(pin =>
    pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid #ddd',
        paddingBottom: '0.5rem',
        gap: '1rem'
      }}>
        <input
          type="text"
          placeholder="Search pins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '8px',
            border: '1px solid #ccc'
          }}
        />
        <button onClick={() => navigate('/profile')}>Profile</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <img src='/settings-icon.jpg'/>
          <button onClick={() => navigate('/settings')}>Settings</button> 
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {filteredPins.map((pin) => (
          <div
            key={pin._id}
            onClick={() => navigate(`/pin/${pin._id}`)}
            style={{
              border: '1px solid #eee',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <img
              src={pin.imageUrl || '/placeholderImage.png'}
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = '/placeholderImage.png'; // fallback image
              }}
              alt={pin.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '0.75rem' }}>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>{pin.title}</h4>
              <p style={{ margin: 0, color: '#666' }}>{pin.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/create-pin')}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#E60023',
          color: '#fff',
          padding: '0.75rem 1.25rem',
          borderRadius: '50%',
          fontSize: '1.5rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        +
      </button>
    </div>
  );
};

export default HomeScreen;
