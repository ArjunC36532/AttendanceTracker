import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { app, auth } from './firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import axios from 'axios';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      // Create user with email and password in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update user profile with full name in Firebase (optional, consider if still needed or how to combine names)
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      // Prepare data for backend
      const teacherData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
      };

      // Call backend to add user (teacher) to database
      const backendResponse = await axios.post('https://tplinux.taile388eb.ts.net/add-user', teacherData); // Assuming your backend runs on port 8000
      console.log('Backend response:', backendResponse.data);

      // Successful signup
      console.log('Signup successful:', userCredential.user);
      navigate('/login-page'); // Redirect to login page after successful signup
      
    } catch (error) {
      console.error('Signup error:', error);
      // Handle different types of errors
      if (error.code) {
        setError(error.code);
      } else if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  const handleLogin = () => {
    navigate('/login-page');
  };

  return (
    <div className="signup-container">
      {/* Background Decoration */}
      <div className="background-decoration">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>

      {/* Signup Card */}
      <div className="signup-card">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo">
            <Check size={24} strokeWidth={2.5} />
          </div>
          <h1>Create Account</h1>
          <p>Join AttendanceTracker today</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <div className="signup-form">
          {/* First Name Field */}
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          {/* Last Name Field */}
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              required
            />
          </div>

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
              placeholder="Create a password"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            className="submit-btn"
            onClick={handleSubmit}
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Login Link */}
          <div className="login-section">
            <span>Already have an account? </span>
            <button 
              type="button" 
              className="login-link"
              onClick={handleLogin}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 