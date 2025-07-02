import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { app, auth } from './firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './login.css';
import axios from 'axios';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Successful login
      console.log('Login successful:', userCredential.user.email);

      // Make Axios request to get user ID
      try {
        const userIdResponse = await axios.get(`https://tplinux.taile388eb.ts.net/get-user-id?email=${encodeURIComponent(userCredential.user.email)}`);
        console.log('User ID from backend:', userIdResponse.data.user_id);
        
        if (userIdResponse.data && userIdResponse.data.user_id) {
          localStorage.setItem('id', userIdResponse.data.user_id); // Save only the user_id
        } else {
          console.warn('User ID not found in backend response:', userIdResponse.data);
          // Optionally, handle the case where user_id is not returned
        }
      } catch (axiosError) {
        console.error('Error getting user ID from backend:', axiosError);
        // Optionally, set an error state to display to the user
      }

      navigate('/home-page');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.code);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, formData.email);
      alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.code);
    }
  };

  const handleSignUp = () => {
    navigate('/signup-page');
  };

  return (
    <div className="login-container">
      {/* Background Decoration */}
      <div className="background-decoration">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo">
            <Check size={24} strokeWidth={2.5} />
          </div>
          <h1>AttendanceTracker</h1>
          <p>Streamline your classroom attendance</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <div className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Form Options */}
          <div className="form-options">
            <button 
              type="button" 
              className="forgot-password"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button 
            className="submit-btn"
            onClick={handleSubmit}
          >
            Sign In
          </button>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Signup Link */}
          <div className="signup-section">
            <span>Don't have an account? </span>
            <button 
              type="button" 
              className="signup-link"
              onClick={handleSignUp}
            >
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;