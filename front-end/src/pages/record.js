import React, { useState } from 'react';
import { Button, Select, TimePicker } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import './record.css';
import SetupRecorder from '../components/setup-recorder';
import WebCamWindow from '../components/WebCamWindow';

const { Option } = Select;

const Record = () => {
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [formData, setFormData] = useState(null);

    const handleFormSubmit = (data) => {
        setFormData(data);
        setIsFormSubmitted(true);
    };

    const handleCancel = () => {
        setIsFormSubmitted(false);
        setFormData(null);
    };

    if(!isFormSubmitted){
        return(<SetupRecorder onSubmit={handleFormSubmit} />)
    } else{
        return(<WebCamWindow onCancel={handleCancel} duration={formData.duration} />)
    }
};

export default Record;