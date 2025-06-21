import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import StartPage from './pages/start';
import SignupPage from './pages/signup';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<StartPage />} />
        <Route path="/start-page" element={<StartPage />} />
        <Route path="/login-page" element={<LoginPage />} />
        <Route path="/signup-page" element={<SignupPage />} />
        
        {/* Home page */}
        <Route path="/home-page" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
