import React, { useState } from 'react';
import { Button, Select } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import './add-student.css';

const { Option } = Select;

const AddStudent = ({ onClassAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    class_name: '',
    photo: null
  });

  const[classes, setClasses] = useState([])

  useEffect(() => {
    const id = localStorage.getItem('id');
    axios.get(`http://localhost:8000/get-classes?teacher_id=${id}`)
    .then(response => {
        setClasses(response.data)
    }).catch(error => {
        console.error("Error Fetching Classes", error);
    })
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClassChange = (value) => {
    setFormData(prev => ({
      ...prev,
      class_name: value
    }));
  };

  // Simple photo upload handler
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    console.log('Selected file:', file); // Debug log
    
    setFormData(prev => ({
      ...prev,
      photo: file || null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data before submit:', formData); // Debug log
    console.log('Photo file:', formData.photo); // Debug log
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('class_name', formData.class_name);
      const id = localStorage.getItem('id');
      formDataToSend.append('id', id);
      
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
        console.log('Photo added to FormData:', formData.photo.name);
      }

      // Debug: Log all FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }

      const response = await axios.post('http://localhost:8000/add-student', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to add student');
      }

      alert('Student added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        class_name: '',
        photo: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('photo-input');
      if (fileInput) fileInput.value = '';

      // Refresh Sidebar
      if (onClassAdded) {
        onClassAdded();
      }


      
    } catch (error) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add student. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="add-student-container">
      <div className="form-card">
        <h1>Add New Student</h1>
        
        <form onSubmit={handleSubmit} className="student-form">
          {/* Name Input */}
          <div className="form-group">
            <label htmlFor="name">Student Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter student's full name"
              required
            />
          </div>

          {/* Class Selection */}
          <div className="form-group">
            <label htmlFor="class">Class</label>
            <Select
              id="class"
              value={formData.class_name}
              onChange={handleClassChange}
              placeholder="Select class"
              className="class-select"
            >
              {classes.map(className => (
                <Option key={className} value={className}>{className}</Option>
              ))}
            </Select>
          </div>

          {/* Simple Photo Upload */}
          <div className="form-group">
            <label htmlFor="photo-input">Student Photo</label>
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              onChange={handlePhotoChange}
              className="photo-input"
            />
            <p className="upload-hint">
              {formData.photo 
                ? `Selected: ${formData.photo.name}` 
                : 'Choose a clear photo of the student'
              }
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="primary" 
            htmlType="submit"
            className="submit-button"
          >
            Add Student
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;