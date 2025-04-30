import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dummyBoards, { getPinById, getCurrentUser } from '../data/dummyData';

const PinDetailScreen = () => {
  const { pinId } = useParams();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const foundPin = getPinById(pinId);
    if (!foundPin) {
      setLoading(false);
      return;
    }
    setPin(foundPin);
    setComments(foundPin.comments || []);
    setLoading(false);
  }, [pinId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      _id: `comment_${Date.now()}`,
      text: newComment,
      author: currentUser,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  if (loading) return <div>Loading...</div>;
  if (!pin) return <div>Pin not found</div>;

  return (
    <div className="pin-detail">
      <img src={pin.imageUrl} alt={pin.title} style={{ width: '100%', maxHeight: '60vh', objectFit: 'cover' }} />
      <h1>{pin.title}</h1>
      <p>{pin.description}</p>

      <div>
        <strong>Author:</strong> {pin.author?.username}
      </div>
      <div>
        <strong>Board:</strong> {pin.board?.name}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <h3>Tags</h3>
        <div>
          {pin.tags?.map(tag => (
            <span key={tag} style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#eee', borderRadius: '4px' }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <hr />

      <div>
        <h3>Comments ({comments.length})</h3>
        {comments.map(c => (
          <div key={c._id} style={{ marginBottom: '0.5rem' }}>
            <strong>{c.author.username}</strong>: {c.text}
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <textarea
          placeholder="Add a comment"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          rows={3}
          style={{ width: '100%', marginTop: '1rem' }}
        />
        <button onClick={handleAddComment} style={{ marginTop: '0.5rem' }}>
          Post Comment
        </button>
      </div>
    </div>
  );
};

export default PinDetailScreen;
