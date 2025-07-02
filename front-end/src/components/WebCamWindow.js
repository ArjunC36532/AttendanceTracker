import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useFaceDetection } from 'react-use-face-detection';
import { Button } from 'antd';
import axios from 'axios'
import './WebCamWindow.css';  // We'll create this file next
import { message } from 'antd';

const width = 800;
const height = 800;

function WebCamWindow({ onCancel, onSubmit, duration, class_name}) {
  const [timer, setTimer] = useState(5); // 5 second countdown
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(duration * 60); // Total time in seconds
  const [faces, setFaces] = useState([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [capturedEmbeddings, setCapturedEmbeddings] = useState([]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const embeddingsRef = useRef([]); // Ref to track embeddings
  const boundingBoxRef = useRef();
  const webcamRefRef = useRef();
  const shutterSound = useRef(new Audio('/audio/shutter.mp3')); 
  const { webcamRef, boundingBox, isLoading, detected, facesDetected } = useFaceDetection({
    faceDetectionOptions: {
      model: 'short',
    },
    faceDetection: new window.FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    }),
    camera: ({ mediaSrc, onFrame }) =>
      new window.Camera(mediaSrc, {
        onFrame,
        width,
        height,
      }),
  });

  // Update refs with current values
  boundingBoxRef.current = boundingBox;
  webcamRefRef.current = webcamRef;

  // Generate cutouts from webcam feed
  function generateCutouts(){
    if (boundingBoxRef.current?.length > 0 && webcamRefRef.current?.current) {
  
      // Trigger flash animation
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200); // Flash for 200ms
      
      boundingBoxRef.current.forEach((box, index) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Convert percentage to pixels
        const x = box.xCenter * width;
        const y = box.yCenter * height;
        const w = box.width * width;
        const h = box.height * height;
        
        // Set canvas size to match the full video dimensions
        canvas.width = webcamRefRef.current.current.video.videoWidth;
        canvas.height = webcamRefRef.current.current.video.videoHeight;
        
        // Draw the entire video frame
        ctx.drawImage(
          webcamRefRef.current.current.video,
          0, 0, canvas.width, canvas.height,
          0, 0, canvas.width, canvas.height
        );
        
        // Convert to blob and upload immediately
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append("teacher_id", localStorage.getItem('id'));
          formData.append('file', blob, `face_${index}.png`);
          
          try {
            const response = await axios.post('https://tplinux.taile388eb.ts.net/uploadfile/', formData);
          } catch (error) {
            console.error(`Face ${index} failed:`, error);
          }
        });
      });
    }
  }

  async function decrementTimer(){
    setTimer(prevTimer => {
      if (prevTimer <= 0) {
        // Take photo and reset 5-second countdown
        generateCutouts();
        setTotalTimeRemaining(prevTotal => {
          const newTotal = prevTotal - 5;
          if (newTotal <= 0 && !hasCompleted) {
            // Recording is complete
            setIsRecording(false);
            setHasCompleted(true);
            // Call separate function to handle completion
            handleRecordingComplete();
            return 0;
          }
          return newTotal;
        });
        return 5; // Reset to 5 seconds
      } else {
        return prevTimer - 1;
      }
    });
  }

  const handleRecordingComplete = async () => {
    try {
      const teacher_id = localStorage.getItem("id");
      const { data } = await axios.get(`https://tplinux.taile388eb.ts.net/find-matches?teacher_id=${teacher_id}&class_name=${class_name}`);
      if (!data) {
        message.error('No data found.');
        return;
      }
      onSubmit(data);
    } catch (error) {
      message.error("Error fetching results from backend")
    }
  };

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(decrementTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div style={{ width, height, position: 'relative' }}>
        {isFlashing && <div className="flash-overlay" />}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          fontSize: '24px',
          zIndex: 3,
          fontFamily: 'monospace'
        }}>
          {isRecording ? timer : formatTime(totalTimeRemaining)}
        </div>
        {boundingBox.map((box, index) => (
          <div
            key={`${index + 1}`}
            style={{
              border: '4px solid red',
              position: 'absolute',
              top: `${box.yCenter * 100}%`,
              left: `${box.xCenter * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
              zIndex: 1,
            }}
          />
        ))}
        <Webcam
          ref={webcamRef}
          style={{
            height,
            width,
            position: 'absolute',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
        {faces.map(face => {
          console.log('Face dataUrl:', face.dataUrl);
          const saveFace = () => {
            const link = document.createElement('a');
            link.download = `face_${face.id}.png`;
            link.href = face.dataUrl;
            link.click();
          };
          return (
            <div key={face.id}>
              <p>{face.dataUrl}</p>
              <button onClick={saveFace}>Save Face</button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {!isRecording && totalTimeRemaining > 0 && (
          <Button onClick={startRecording} type="primary" style={{ marginRight: '10px' }}>
            Start Recording
          </Button>
        )}
        <Button onClick={onCancel} className="cancel-btn">
          Cancel Recording
        </Button>
      </div>
    </div>
  );
}

export default WebCamWindow;