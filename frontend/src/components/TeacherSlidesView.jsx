import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

const TeacherSlidesView = () => {
  const { sessionId: sessionCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const sessionId = location.state?.sessionId;
  const socketRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/teacher');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${API_URL}/sessions/${sessionId}/questions`);
        setQuestions(res.data.questions);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestions();

    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('joinSession', sessionCode);

    socketRef.current.on('newQuestion', (question) => {
      setQuestions((prev) => [...prev, question]);
    });

    return () => socketRef.current.disconnect();
  }, [sessionCode, sessionId, navigate]);

  const nextSlide = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // ✅ FIXED: send questionId also
  const handleAnswerSubmit = () => {
    if (!answer.trim()) return;

    const currentQuestion = questions[currentIndex];

    socketRef.current.emit("newAnswer", {
      sessionCode: sessionCode,
      questionId: currentQuestion._id, // 🔥 IMPORTANT FIX
      answer: answer,
    });

    setAnswer("");
  };

  if (questions.length === 0) {
    return (
      <div className="slide-view">
        <p>Waiting for questions...</p>
        <p style={{ fontSize: '1rem', color: '#666' }}>
          Session Code: {sessionCode}
        </p>
        <button
          className="btn"
          style={{ marginTop: '2rem' }}
          onClick={() => navigate('/teacher')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div>
      <div className="slide-view">
        <p style={{ fontSize: '1rem', color: '#666', marginBottom: 'auto' }}>
          Session Code: {sessionCode} | Question {currentIndex + 1} of {questions.length}
        </p>

        <h2 style={{ margin: '2rem 0' }}>{currentQuestion.text}</h2>

        <p style={{ fontSize: '1.2rem', color: '#007bff', marginTop: 'auto' }}>
          - {currentQuestion.studentId?.name || 'Unknown Student'}
        </p>
      </div>

      <div className="controls">
        <button className="btn" onClick={prevSlide} disabled={currentIndex === 0}>
          Previous
        </button>
        <button className="btn" onClick={nextSlide} disabled={currentIndex === questions.length - 1}>
          Next
        </button>
      </div>

      {/* Answer UI */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <textarea
          placeholder="Type your answer..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          style={{ width: '60%', padding: '10px', marginBottom: '10px' }}
        />

        <br />

        <button className="btn" onClick={handleAnswerSubmit}>
          Submit Answer
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          className="btn"
          style={{ background: '#6c757d' }}
          onClick={() => navigate('/teacher')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default TeacherSlidesView;