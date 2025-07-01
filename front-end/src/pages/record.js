import React, { useState } from 'react';
import { Button, Select, TimePicker } from 'antd';
import { useEffect } from 'react';
import axios from 'axios';
import './record.css';
import SetupRecorder from '../components/setup-recorder';
import WebCamWindow from '../components/WebCamWindow';
import Results from '../components/results';

const { Option } = Select;

const Record = () => {
    const [isFormSubmitted, setIsFormSubmitted] = useState(false);
    const [formData, setFormData] = useState(null);

    const [showResults, setShowResults] = useState(false)
    const [resultsData, setResultsData] = useState(null);

    const handleFormSubmit = (data) => {
        setFormData(data);
        setIsFormSubmitted(true);
    };

    const handleCancel = () => {
        setIsFormSubmitted(false);
        setFormData(null);
    };

    const handleResultsSubmit = (data) => {
        setResultsData(data);
        setShowResults(true);

    }

    if (!isFormSubmitted) {
        return (<SetupRecorder onSubmit={handleFormSubmit} />);
    } else if (isFormSubmitted && !showResults) {
        return (<WebCamWindow onCancel={handleCancel} onSubmit = {handleResultsSubmit} duration={formData.duration} class_name={formData.class_name} />);
    } else {
        return (<Results data = {resultsData}/>);
    }
};

export default Record;