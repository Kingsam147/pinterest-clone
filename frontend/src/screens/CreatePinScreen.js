import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { dummyBoards, getCurrentUser } from '../data/dummyData';

const CreatePinScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialBoardId = params.get('boardId');
  const pinId = params.get('pinId');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    boardId: initialBoardId || '',
  });

  const [boards, setBoards] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    const userBoards = dummyBoards.filter(b => b.author._id === currentUser._id);
    if (userBoards.length === 0) {
      setError('Please create a board first.');
    } else {
      setBoards(userBoards);
    }
  }, [initialBoardId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.imageUrl || !formData.boardId) {
      setError('All fields are required.');
      return;
    }

    const currentUser = getCurrentUser();
    const selectedBoard = dummyBoards.find(b => b._id === formData.boardId);
    if (!selectedBoard) return setError('Invalid board selected.');

    const newPin = {
      _id: `pin_${Date.now()}`,
      ...formData,
      author: currentUser,
      board: selectedBoard,
      createdAt: new Date().toISOString(),
    };

    selectedBoard.pins.push(newPin);
    navigate('/home');
  };

  return (
    <div className="create-pin">
      <h2>{pinId ? 'Edit Pin' : 'Create Pin'}</h2>

      {error && <p className="error">{error}</p>}

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
      {formData.imageUrl && <img src={formData.imageUrl} alt="preview" style={{ width: '200px' }} />}

      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
      />
      <select
        value={formData.boardId}
        onChange={e => setFormData({ ...formData, boardId: e.target.value })}
      >
        <option value="">Select a board</option>
        {boards.map(board => (
          <option key={board._id} value={board._id}>
            {board.name}
          </option>
        ))}
      </select>

      <button onClick={handleSubmit}>
        {pinId ? 'Update Pin' : 'Create Pin'}
      </button>
    </div>
  );
};

export default CreatePinScreen;
