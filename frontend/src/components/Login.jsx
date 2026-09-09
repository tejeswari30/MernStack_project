import React, { useState } from 'react'; //state management
import axios from 'axios'; // API communication b/w frontend&backend
import { useAuth } from '../context/AuthContext'; //authentication management

//Backend API URL
const API_URL = 'http://localhost:5000/api';

const Login = () => {
  const { login } = useAuth(); //Used AuthContext to manage user login globally throughout the application

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Student'); 
  const [error, setError] = useState('');

  // Form Submission Function 
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevents automatic page refresh during form submission

    try {
      // Sending Data to Backend
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        name,
        role
      });
      //After successful authentication, user data is stored using AuthContext
      login(res.data.user);

    } 
    // If login fails, an error message is displayed to the user
    catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h2>Welcome to Vi-SlideS</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit}>

        <input
          className="input-field"
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input-field"
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          className="input-field"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="Student">Student</option>
          <option value="Teacher">Teacher</option>
        </select>

        <button className="btn" type="submit">
          Login
        </button>
        {/* 
        //this component collects user details, sends them to backend APIs 
        //using Axios, authenticates the user through MongoDB, and stores login session using AuthContext */}

      </form>
    </div>
  );
};

export default Login;