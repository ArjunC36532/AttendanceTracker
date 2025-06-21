import React from 'react';
import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './start.css';

function StartPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login-page');
  };

  return (
    <div className="start-container">
      {/* Background Decoration */}
      <div className="background-decoration">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>

      <div className="content-wrapper">
        <h1 className="title">Welcome to Attendance Tracker</h1>
        <p className="subtitle">
          Streamline your classroom management with our intelligent attendance tracking system.
          Get started now to experience the future of attendance management.
        </p>
        <Button 
          type="primary" 
          className="get-started-button"
          onClick={handleGetStarted}
        >
          Get Started <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
}

export default StartPage; 