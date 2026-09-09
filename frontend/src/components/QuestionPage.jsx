import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

const QuestionPage = () => {
  const { sessionId: sessionCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [socket, setSocket] = useState(null);

  const sessionId = location.state?.sessionId;

  useEffect(() => {
    if (!sessionId) {
      navigate('/student');
      return;
    }

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.emit('joinSession', sessionCode);

    return () => newSocket.close();
  }, [sessionCode, sessionId, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (socket && text.trim() && sessionId) {
      socket.emit('newQuestion', {
        sessionId,
        sessionCode,
        studentId: user._id,
        text
      });
      setText('');
      alert('Question submitted!');
    }
  };

  return (
    <div className="card">
      <h2>Session: {sessionCode}</h2>
      <p>Submit your question below:</p>
      <form onSubmit={handleSubmit}>
        <textarea 
          className="input-field"
          rows="4"
          placeholder="Type your question..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          required 
        />
        <button className="btn" type="submit">Submit Question</button>
      </form>
      <button className="btn" style={{ marginTop: '1rem', background: '#6c757d' }} onClick={() => navigate('/student')}>Leave Session</button>
    </div>
  );
};

export default QuestionPage;
