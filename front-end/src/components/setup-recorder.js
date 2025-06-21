import React, { useState, useEffect } from 'react';
import { Button, Select, InputNumber } from 'antd';
import axios from 'axios';
import './setup-recorder.css';

const { Option } = Select;

const SetupRecorder = ({ onSubmit }) => {
  const [duration, setDuration] = useState(null);
  const [class_name, setClassName] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const id = localStorage.getItem('id');
    axios.get(`http://localhost:8000/get-classes?teacher_id=${id}`)
      .then(response => {
        setClasses(response.data);
      })
      .catch(error => {
        console.error("Error Fetching Classes", error);
      });
  }, []);

  const handleClassChange = (value) => {
    setClassName(value);
  };

  const handleDurationChange = (value) => {
    setDuration(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Duration:', duration, 'Class:', class_name);

    // Call the onSubmit callback with duration and class
    if (onSubmit && duration && class_name) {
      onSubmit({ duration, class_name });
    }
  };

  return (
    <div className="setup-recorder-container">
      <div className="form-card">
        <h1>Start Recording</h1>
        
        <form onSubmit={handleSubmit} className="record-form">
          {/* Class Selection */}
          <div className="form-group">
            <label htmlFor="class">Class</label>
            <Select
              id="class"
              value={class_name}
              onChange={handleClassChange}
              placeholder="Select class"
              className="class-select"
            >
              {classes.map(className => (
                <Option key={className} value={className}>{className}</Option>
              ))}
            </Select>
          </div>

          {/* Duration Input */}
          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <InputNumber
              id="duration"
              min={1}
              max={480}
              placeholder="Enter duration in minutes"
              onChange={handleDurationChange}
              className="duration-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="primary" 
            htmlType="submit"
            className="submit-button"
            disabled={!duration || !class_name}
          >
            Click to Ready
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetupRecorder; 