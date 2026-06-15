import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI, boardsAPI } from '../services/api';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedView, setSelectedView] = useState('pins');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const [profileData, pinsData, boardsData] = await Promise.all([
          usersAPI.getUserById(user.id || user._id),
          usersAPI.getUserPins(user.id || user._id),
          boardsAPI.getBoardsByUser(user.id || user._id),
        ]);
        setUserProfile(profileData);
        setPins(pinsData);
        setBoards(boardsData);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '2rem', color: '#E60023' }}>{error}</div>;
  if (!userProfile) return null;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '1rem' }}>
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <img
          src={userProfile.avatar || 'https://i.pravatar.cc/150'}
          alt="avatar"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }}
        />
        <h2 style={{ margin: '0.75rem 0 0.25rem' }}>{userProfile.username}</h2>
        <p style={{ color: '#666', margin: '0 0 0.5rem' }}>{userProfile.email}</p>
        {userProfile.bio && (
          <p style={{ maxWidth: 500, margin: '0 auto 1rem', color: '#444' }}>{userProfile.bio}</p>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <strong>{pins.length}</strong>
          <div style={{ color: '#666', fontSize: 14 }}>Pins</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong>{userProfile.followers?.length ?? 0}</strong>
          <div style={{ color: '#666', fontSize: 14 }}>Followers</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong>{userProfile.following?.length ?? 0}</strong>
          <div style={{ color: '#666', fontSize: 14 }}>Following</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/create-pin')} style={styles.actionButton}>
          + Create Pin
        </button>
        <button onClick={handleLogout} style={{ ...styles.actionButton, backgroundColor: '#666' }}>
          Log Out
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setSelectedView('pins')}
          style={{ ...styles.tabButton, borderBottom: selectedView === 'pins' ? '2px solid #E60023' : 'none' }}
        >
          Pins
        </button>
        <button
          onClick={() => setSelectedView('boards')}
          style={{ ...styles.tabButton, borderBottom: selectedView === 'boards' ? '2px solid #E60023' : 'none' }}
        >
          Boards
        </button>
      </div>

      {selectedView === 'pins' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {pins.map((pin) => (
            <div
              key={pin._id}
              onClick={() => navigate(`/pin/${pin._id}`)}
              style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
            >
              <img
                src={pin.imageUrl}
                alt={pin.title}
                style={{ width: '100%', height: 150, objectFit: 'cover' }}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200x150'; }}
              />
              <div style={{ padding: '0.5rem' }}>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: 14 }}>{pin.title}</p>
              </div>
            </div>
          ))}
          {pins.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center', gridColumn: '1 / -1' }}>No pins yet.</p>
          )}
        </div>
      ) : (
        <div>
          {boards.map((board) => (
            <div
              key={board._id}
              style={{ display: 'flex', alignItems: 'center', border: '1px solid #eee', borderRadius: 12, marginBottom: '1rem', padding: '1rem', cursor: 'pointer' }}
              onClick={() => navigate(`/boards/${board._id}`)}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{board.title}</h4>
                <p style={{ margin: 0, color: '#888', fontSize: 14 }}>{board.pins?.length ?? 0} pins</p>
              </div>
            </div>
          ))}
          {boards.length === 0 && (
            <p style={{ color: '#666', textAlign: 'center' }}>No boards yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  actionButton: {
    padding: '8px 20px',
    backgroundColor: '#E60023',
    color: '#fff',
    border: 'none',
    borderRadius: 20,
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  tabButton: {
    background: 'none',
    border: 'none',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    color: '#333',
  },
};

export default ProfileScreen;
