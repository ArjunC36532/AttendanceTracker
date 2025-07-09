import React, { useEffect, useState } from 'react';
import './student-attendance-data.css';
import { Table } from 'antd';
import axios from 'axios';

const StudentAttendanceData = ({ data }) => {
  const [className, studentName] = data.split("-");
  const [displayName, setDisplayName] = useState("");
  const columns = [
    {
      title: 'Name',
      dataIndex: 'student_name',
      key: 'name',
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance_status',
      key: 'attendance',
    },
    {
      title: 'Date',
      dataIndex: 'attendance_date',
      key: 'date',
    },
    {
      title: 'Time',
      dataIndex: 'attendance_time',
      key: 'time',
    },
  ];

  const [dataSource, setDataSource] = useState([]);

  const handleRemoveStudent = async () => {
    const teacher_id = localStorage.getItem('id');
    try {
      const response = await axios.get(`http://localhost:8000/remove-student?teacher_id=${teacher_id}&class_name=${className}&student_name=${studentName}`);
      console.log(response.data);
      window.location.reload();
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  const handleRemoveClass = async () => {
    const teacher_id = localStorage.getItem("id")
    console.log(teacher_id)
    console.log(className)
    try{
      const response = await axios.get(`http://localhost:8000/remove-class?teacher_id=${teacher_id}&class_name=${className}`);
      console.log(response.data)
      window.location.reload();
    } catch(error){
      console.error("Error removing class", error)
    }
  };

  useEffect(() => {
    const teacher_id = localStorage.getItem('id')
    const fetchData = async () => {
      try {
        const displayName = studentName === "all" ? "All Students" : studentName;
        setDisplayName(displayName)
        const response = await axios.get(`http://localhost:8000/get-table?class_name=${className}&student_name=${studentName}&teacher_id=${teacher_id}`)
        console.log(response.data);
        setDataSource(response.data)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if(studentName == "all"){}
    fetchData();
  }, [className, studentName]);

  return (
    <div className="student-attendance-container">
      <div className="student-attendance-card">
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button className="remove-student-button" onClick={handleRemoveStudent}>
            Remove Student
          </button>
          <button className="remove-class-button" onClick={handleRemoveClass} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
            Remove Class
          </button>
        </div>
        <div className="student-table-section">
          <h1 className="student-name-header">{displayName}</h1>
          <Table dataSource={dataSource} columns={columns} />
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceData; 