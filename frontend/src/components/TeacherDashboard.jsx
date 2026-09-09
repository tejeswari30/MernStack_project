import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  const startClass = async () => {
    try {
      const res = await axios.post(`${API_URL}/sessions`, { teacherId: user._id });
      setSession(res.data.session);
    } catch (err) {
      console.error(err);
    }
  };

  const goToSlides = () => {
    navigate(`/teacher/session/${session.code}/slides`, { state: { sessionId: session._id } });
  };

  return (
    <div className="card">
      <h2>Teacher Dashboard</h2>
      <p>Welcome, {user.name}!</p>
      
      {!session ? (
        <button className="btn" onClick={startClass}>Start Class</button>
      ) : (
        <div>
          <h3>Class is Live!</h3>
          <p>Session Code: <strong>{session.code}</strong></p>
          <button className="btn" onClick={goToSlides}>Open Slide View</button>
        </div>
      )}
      
      <button className="btn" style={{ marginTop: '1rem', background: '#dc3545' }} onClick={logout}>Logout</button>
    </div>
  );
};

export default TeacherDashboard;
