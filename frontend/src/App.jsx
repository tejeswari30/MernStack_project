import React from 'react';

// Used React Router for navigation between pages without refreshing the application
import { BrowserRouter as Router, Routes, Route, Navigate }
from 'react-router-dom';

// AuthContext which manages user authentication globally
import { useAuth } from './context/AuthContext';

//Different components are imported for Teacher and Student functionalities.
import Login from './components/Login';
import TeacherDashboard from './components/TeacherDashboard';
import StudentJoin from './components/StudentJoin';
import TeacherSlidesView from './components/TeacherSlidesView';
import StudentSession from './components/StudentSession';

function App() {
  // access authenticated user information and loading state from AuthContext
  const { user, loading } = useAuth();

  //prevents rendering pages until authentication data is fully loaded
  if (loading) return <div>Loading...</div>;

  return (
    <Router> //BrowserRouter enables client-side routing in React
      <div className="app-container">
        <Routes> // contains all application routes

          {/* Home */}
          <Route
            path="/"
            element={
              !user
                ? <Login />
                : (user.role === 'Teacher'
                    ? <Navigate to="/teacher" />
                    : <Navigate to="/student" />)
            }
          />

          {/* Teacher Dashboard */}
          <Route
            path="/teacher"
            //Protected routes ensure only authenticated users can access specific pages
            element={user && user.role === 'Teacher' ? <TeacherDashboard /> : <Navigate to="/" />}
          />

          {/* Student Join */}
          <Route
            path="/student"
            //Navigate automatically redirects users to the correct page
            element={user && user.role === 'Student' ? <StudentJoin /> : <Navigate to="/" />}
          />

          {/*  FIXED: ONLY ONE student session route */}
          <Route
          // Dynamic routing is used here
            path="/student/session/:sessionId"
            element={user && user.role === 'Student' ? <StudentSession /> : <Navigate to="/" />}
          />

          {/* Teacher Slides */}
          <Route
            path="/teacher/session/:sessionId/slides"
            element={user && user.role === 'Teacher' ? <TeacherSlidesView /> : <Navigate to="/" />}
          />
        //App.jsx controls navigation flow, authentication checks, role-based access, and protected routing for 
            the entire application
        </Routes>
      </div>
    </Router>
  );
}

export default App;