import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const StudentJoin = () => {
  const { user, logout } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/sessions/join`, { code });
      const session = res.data.session;
      navigate(`/student/session/${session.code}`, { state: { sessionId: session._id } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join session');
    }
  };

  return (
    <div className="card">
      <h2>Join a Class</h2>
      <p>Welcome, {user.name}!</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleJoin}>
        <input 
          className="input-field"
          type="text" 
          placeholder="Enter Session Code" 
          value={code} 
          onChange={(e) => setCode(e.target.value.toUpperCase())} 
          required 
        />
        <button className="btn" type="submit">Join Class</button>
      </form>
      <button className="btn" style={{ marginTop: '1rem', background: '#dc3545' }} onClick={logout}>Logout</button>
    </div>
  );
};

export default StudentJoin;
