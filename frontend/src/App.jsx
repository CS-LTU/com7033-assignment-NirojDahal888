// App.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, Users, Check, LogOut, User } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PatientManager from './components/PatientManager';
import SessionExpired from './pages/SessionExpired';

const API_URL = 'http://localhost:8000';

// API helper
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

function AuthPage({ setUser }) {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await apiCall('/api/auth/current_user');
      setUser(data.user);
      setSuccess('Logged in successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!/^[A-Za-z0-9]+$/.test(username)) {
      setError('Username can only contain letters and numbers');
      return;
    }

    try {
      await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await apiCall('/api/auth/current_user');
      setUser(data.user);
      setSuccess('Registered successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') action();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <Users className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Patient Management
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setView('login')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              view === 'login'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setView('register')}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              view === 'register'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, view === 'login' ? handleLogin : handleRegister)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, view === 'login' ? handleLogin : handleRegister)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter password"
            />
          </div>

          <button
            onClick={view === 'login' ? handleLogin : handleRegister}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            {view === 'login' ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardWrapper({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('http://localhost:8000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="font-medium">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <PatientManager />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall('/api/auth/current_user')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage setUser={setUser} />}
      />
      <Route
        path="/dashboard"
        element={user ? <DashboardWrapper user={user} setUser={setUser} /> : <Navigate to="/" />}
      />
      <Route
        path="/session-expired"
        element={<SessionExpired />}
      />
    </Routes>
  );
}

