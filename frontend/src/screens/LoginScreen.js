import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanPassword = formData.password.replace(/^Password:\s*/i, '');
      await login({ ...formData, password: cleanPassword });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.logo}>Pinterest</h1>
        <h2 style={styles.title}>Welcome Back</h2>

        {error && <p style={styles.error}>{error}</p>}

        {/* <div style={styles.testCredentials}>
          <p>
            <strong>Test credentials:</strong><br />
            Email: john@example.com<br />
            Password: password123<br />
            <em>Note: Enter the password without any prefix</em>
          </p>
        </div> */}

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

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
          style={styles.linkButton}
        >
          Don't have an account? Sign up
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
  logo: {
    fontSize: 40,
    color: '#E60023',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  testCredentials: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
    color: '#444',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    marginBottom: 16,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
};

export default LoginScreen;
