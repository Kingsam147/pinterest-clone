import config from '../config';

const API_URL = config.API_URL;

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'x-auth-token': getToken() || '',
});

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }
  return response.json();
};

export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },
};

export const pinsAPI = {
  getAllPins: async () => {
    const response = await fetch(`${API_URL}/pins`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getPinById: async (pinId) => {
    const response = await fetch(`${API_URL}/pins/${pinId}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  search: async (query) => {
    const response = await fetch(`${API_URL}/pins/search?q=${encodeURIComponent(query)}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  createPin: async (pinData) => {
    const response = await fetch(`${API_URL}/pins`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(pinData),
    });
    return handleResponse(response);
  },

  updatePin: async (pinId, pinData) => {
    const response = await fetch(`${API_URL}/pins/${pinId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(pinData),
    });
    return handleResponse(response);
  },

  deletePin: async (pinId) => {
    const response = await fetch(`${API_URL}/pins/${pinId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },
};

export const boardsAPI = {
  getBoardsByUser: async (userId) => {
    const response = await fetch(`${API_URL}/boards/user/${userId}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getBoardById: async (boardId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  createBoard: async (boardData) => {
    const response = await fetch(`${API_URL}/boards`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  },

  updateBoard: async (boardId, boardData) => {
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  },

  deleteBoard: async (boardId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  addPin: async (boardId, pinId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/pins`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ pinId }),
    });
    return handleResponse(response);
  },

  removePin: async (boardId, pinId) => {
    const response = await fetch(`${API_URL}/boards/${boardId}/pins/${pinId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },
};

export const commentsAPI = {
  getByPin: async (pinId) => {
    const response = await fetch(`${API_URL}/comments/pin/${pinId}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  create: async (pinId, text) => {
    const response = await fetch(`${API_URL}/comments/pin/${pinId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(response);
  },

  delete: async (commentId) => {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },
};

export const usersAPI = {
  getUserById: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  getUserPins: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/pins`, {
      headers: authHeaders(),
    });
    return handleResponse(response);
  },

  followUser: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/follow`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    return handleResponse(response);
  },
};
