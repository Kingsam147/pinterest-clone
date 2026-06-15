import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Create Account</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          style={styles.linkButton}
        >
          Already have an account? Sign in
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: 16,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#E60023',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: 12,
  },
  linkButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#E60023',
    fontSize: 14,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  error: {
    color: '#E60023',
    textAlign: 'center',
    marginBottom: 12,
  },
};

export default RegisterScreen;
