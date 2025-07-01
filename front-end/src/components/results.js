import React, { useRef, useEffect } from 'react';
import './results.css';
import { Table } from "antd";

const Results = ({ data = {} }) => {
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance',
      key: 'attendance',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },

    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    }
  ];

  return (
    <div className="results-container">
      <div className="results-card">
        <h1>Results</h1>
        console.log(data)
        <Table dataSource={data} columns={columns} />;
      </div>
    </div>
  );
};

export default Results;
