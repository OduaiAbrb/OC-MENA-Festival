import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Scanner.css';

const Scanner = () => {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningIntervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const toggleFlashlight = async () => {
    if (!streamRef.current) return;

    try {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities();
        if (capabilities.torch) {
          await videoTrack.applyConstraints({
            advanced: [{ torch: !flashlightOn }]
          });
          setFlashlightOn(!flashlightOn);
        }
      }
    } catch (error) {
      console.error('Error toggling flashlight:', error);
    }
  };

  const handleVideoLoaded = () => {
    setVideoReady(true);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current && videoReady && 
        videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      try {
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        // Simulate QR code detection - in a real app you'd use a QR scanning library
        // For demo purposes, we'll randomly detect a QR code after some time
        const randomDetection = Math.random();
        if (randomDetection > 0.98) { // 2% chance per frame to simulate QR detection
          navigate('/success');
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
      }
    }
  };

  useEffect(() => {
    if (videoReady) {
      scanningIntervalRef.current = setInterval(captureFrame, 1000); // Check every second
    }
    return () => {
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
      }
    };
  }, [videoReady]);

  const handleCheckTicket = () => {
    navigate('/success');
  };

  if (cameraError) {
    return (
      <div className="scanner-page">
        <div className="scanner-header">
          <div className="scanner-logo">
            <img src="/logo.png" alt="Festival Logo" className="logo-img" />
          </div>
          <h1 className="scanner-title">Festival Entry Scanner</h1>
        </div>

        <div className="scanner-content">
          <div className="camera-error">
            <div className="error-icon">📱</div>
            <h2>Camera Not Available</h2>
            <p>This scanner is designed for mobile devices with cameras.</p>
            <p>Please open this page on your phone to scan QR codes.</p>
            
            <div className="qr-frame demo-frame">
              <div className="qr-corner qr-corner-tl"></div>
              <div className="qr-corner qr-corner-tr"></div>
              <div className="qr-corner qr-corner-bl"></div>
              <div className="qr-corner qr-corner-br"></div>
            </div>
          </div>

          <div className="scanner-controls">
            <button
              className="btn-check-ticket"
              onClick={handleCheckTicket}
            >
              Check Ticket (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-page">
      <div className="scanner-header">
        <div className="scanner-logo">
          <img src="/logo.png" alt="Festival Logo" className="logo-img" />
        </div>
        <h1 className="scanner-title">Festival Entry Scanner</h1>
      </div>

      <div className="scanner-content">
        <div className="video-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed"
            onLoadedData={handleVideoLoaded}
          />
          <div className="qr-frame">
            <div className="qr-corner qr-corner-tl"></div>
            <div className="qr-corner qr-corner-tr"></div>
            <div className="qr-corner qr-corner-bl"></div>
            <div className="qr-corner qr-corner-br"></div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div className="scanner-controls">
          <button
            className="btn-flashlight"
            onClick={toggleFlashlight}
            title="Toggle Flashlight"
          >
            {flashlightOn ? '💡 Flashlight On' : '🔦 Toggle Flashlight'}
          </button>

          <button
            className="btn-check-ticket"
            onClick={handleCheckTicket}
          >
            Check Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
