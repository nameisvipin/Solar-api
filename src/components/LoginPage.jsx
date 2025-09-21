// src/components/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Login.css'; // Make sure the CSS is imported

const LoginPage = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Reset states on new login attempt
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post('https://test.bsesbrpl.co.in/solar_api/API/SOLARAPI/login', {
        user_id: userId,
        password: password
      }, {
        // Allow 401 status to not trigger catch
        validateStatus: (status) => {
          return status >= 200 && status < 500;  // Treat 401 as a valid response
        }
      });

      if (response.data.Status === '200') {
        sessionStorage.setItem('token', response.data.Token);
        setSuccessMessage('Login Successful! Redirecting...');

        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else if (response.data.Status === '401') {
        setError(response.data.Message || 'Invalid Password / Unauthorized User');
      } else if (response.data.Status === '500') {
        setError(response.data.Message || 'Internal Server Error');
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } catch (err) {
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      if (!successMessage) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <h1>
            <img
              src="/solar.svg"
              alt="Solar API Logo"
              className="login-logo-svg"
            />
            Solar API
          </h1>


        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={loading} // Disable input while loading
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading} // Disable input while loading
            />
          </div>

          {/* Container for feedback messages */}
          <div className="feedback-container">
            {error && <div className="login-feedback error">{error}</div>}
            {successMessage && <div className="login-feedback success">{successMessage}</div>}
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;