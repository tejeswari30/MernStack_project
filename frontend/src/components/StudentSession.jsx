import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

const StudentSession = () => {
  const { sessionId: sessionCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sessionId = location.state?.sessionId;

  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      navigate("/student");
      return;
    }

    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit("joinSession", sessionCode);

    // Receive questions
    socketRef.current.on("newQuestion", (q) => {
      setQuestions((prev) => [...prev, q]);
    });

    // Receive answers
    socketRef.current.on("newAnswer", (a) => {
      setAnswers((prev) => [...prev, a]);
    });

    return () => socketRef.current.disconnect();
  }, [sessionCode, sessionId, navigate]);

  // Send question
  const handleSubmit = (e) => {
    e.preventDefault();

    socketRef.current.emit("newQuestion", {
      sessionId,
      sessionCode,
      studentId: user._id,
      text: question,
    });

    setQuestion("");
  };

  return (
    <div className="card">
      <h2>Session: {sessionCode}</h2>

      {/* Ask Question */}
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          required
        />
        <button className="btn" type="submit">
          Submit Question
        </button>
      </form>

      {/* Questions + Answers */}
      <h3 style={{ marginTop: "20px" }}>Live Q&A</h3>

      {questions.length === 0 ? (
        <p>No questions yet</p>
      ) : (
        questions.map((q) => {
          const relatedAnswers = answers.filter(
            (a) => a.questionId?.toString() === q._id?.toString()
          );

          return (
            <div
              key={q._id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              {/* Question */}
              <p>
                🧑 <strong>{q.text}</strong>
              </p>

              {/* Answers */}
              {relatedAnswers.length === 0 ? (
                <p style={{ color: "#999" }}>No answer yet</p>
              ) : (
                relatedAnswers.map((a, index) => (
                  <p key={index} style={{ color: "green" }}>
                    👩‍🏫 {a.answer}
                  </p>
                ))
              )}
            </div>
          );
        })
      )}

      <button
        className="btn"
        style={{ marginTop: "20px", background: "#6c757d" }}
        onClick={() => navigate("/student")}
      >
        Leave Session
      </button>
    </div>
  );
};

export default StudentSession;