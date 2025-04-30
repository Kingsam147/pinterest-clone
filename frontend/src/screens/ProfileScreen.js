import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyPins } from '../data/dummyData';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedView, setSelectedView] = useState('pins');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated fetch
    const dummyUser = {
      _id: 'testuser123',
      username: 'John Doe',
      email: 'john@example.com',
      bio: 'Pinterest enthusiast | Digital Creator | Love sharing beautiful things',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      followers: Array(128).fill('dummy_follower'),
      following: Array(97).fill('dummy_following'),
      pins: dummyPins.slice(0, 15),
      boards: [
        {
          _id: 'board1',
          name: 'Travel Inspiration',
          pins: Array(24).fill('pin'),
          coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        {
          _id: 'board2',
          name: 'Food & Recipes',
          pins: Array(16).fill('pin'),
          coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        {
          _id: 'board3',
          name: 'Interior Design',
          pins: Array(32).fill('pin'),
          coverImage: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
      ],
    };

    setUser(dummyUser);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container" style={{ color: '#fff', backgroundColor: '#121212', padding: '1rem' }}>
      <div style={{ textAlign: 'center' }}>
        <img
          src={user.avatar}
          alt="avatar"
          style={{ width: 120, height: 120, borderRadius: '50%' }}
        />
        <h2>{user.username}</h2>
        <p style={{ color: '#bbb' }}>{user.email}</p>
        <p style={{ maxWidth: 500, margin: 'auto', color: '#aaa' }}>{user.bio}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0', gap: '2rem' }}>
        <div><strong>{user.pins.length}</strong><br />Pins</div>
        <div><strong>{user.followers.length}</strong><br />Followers</div>
        <div><strong>{user.following.length}</strong><br />Following</div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button onClick={() => navigate('/edit-profile')} style={{ marginRight: '1rem' }}>Edit Profile</button>
        <button onClick={() => navigate('/create-board')}>Create Board</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
        <button onClick={() => setSelectedView('pins')} style={{ backgroundColor: selectedView === 'pins' ? '#9C27B0' : '#444' }}>Pins</button>
        <button onClick={() => setSelectedView('boards')} style={{ backgroundColor: selectedView === 'boards' ? '#9C27B0' : '#444' }}>Boards</button>
      </div>

      <div>
        {selectedView === 'pins' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {user.pins.map((pin) => (
              <img
                key={pin._id}
                src={pin.imageUrl}
                alt={pin.title}
                style={{ width: '30%', height: 'auto', borderRadius: 12 }}
                onClick={() => navigate(`/pin/${pin._id}`)}
              />
            ))}
          </div>
        ) : (
          <div>
            {user.boards.map((board) => (
              <div
                key={board._id}
                style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 12, marginBottom: '1rem', padding: '1rem', cursor: 'pointer' }}
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <img src={board.coverImage} alt={board.name} style={{ width: 100, height: 100, borderRadius: 12, marginRight: '1rem' }} />
                <div>
                  <h4 style={{ margin: 0 }}>{board.name}</h4>
                  <p style={{ margin: 0, color: '#bbb' }}>{board.pins.length} pins</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
