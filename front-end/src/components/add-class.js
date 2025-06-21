import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import './add-class.css';
import axios from 'axios';

const AddClass = ({ onClassAdded }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { className } = values;
    const id = localStorage.getItem('id');

    if (!id) {
      message.error('User ID not found. Please log in again.');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:8000/add-class', {
        teacher_id: parseInt(id),
        class_name: className,
      });


      if (response.data.message === "Class added successfully") {
        message.success(`Class '${className}' added successfully!`);
        form.resetFields();
        // Call the callback to refresh the sidebar
        if (onClassAdded) {
          onClassAdded();
        }
      } else {
        message.error(`Failed to add class: ${response.data.error || response.data.message}`);
      }
    } catch (error) {
      console.error('Error adding class:', error);
      message.error('An error occurred while adding the class.');
    }
  };

  return (
    <div className="add-class-container">
      <div className="form-card">
        <h1>Add New Class</h1>
        <Form
          form={form}
          name="add-class"
          initialValues={{ className: '' }}
          onFinish={onFinish}
          className="class-form"
        >
          <Form.Item
            name="className"
            rules={[{ required: true, message: 'Please input a class name!' }]}
          >
            <Input prefix={<TeamOutlined />} placeholder="Class Name" />
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit" className="submit-button">
              Add Class
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddClass; 