import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import api from '../services/api';
import './Scanner.css';

const Scanner = () => {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningIntervalRef = useRef(null);
  const lastScanRef = useRef(null);
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

  const handleScanQR = useCallback(async (qrData) => {
    if (scanning || !qrData) return;
    
    // Prevent duplicate scans within 3 seconds
    const now = Date.now();
    if (lastScanRef.current && (now - lastScanRef.current) < 3000) {
      return;
    }
    
    setScanning(true);
    setError('');
    lastScanRef.current = now;
    
    try {
      const result = await api.quickScan(qrData);
      
      if (result?.success) {
        // Navigate to success page with ticket data
        navigate('/success', { 
          state: { 
            ticketData: result.data,
            checkInTime: new Date().toLocaleString(),
            passType: result.data?.ticket_type || 'N/A',
            daysLeft: result.data?.days_remaining || 'N/A'
          } 
        });
      } else {
        setError(result?.error?.message || 'Invalid ticket');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to validate ticket');
      setTimeout(() => setError(''), 3000);
    } finally {
      setScanning(false);
    }
  }, [scanning, navigate]);

  const captureFrame = useCallback(() => {
    if (videoRef.current && canvasRef.current && videoReady && !scanning &&
        videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
      try {
        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        // Detect QR code using jsQR
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert'
        });
        
        if (qrCode && qrCode.data) {
          // Valid QR code detected
          handleScanQR(qrCode.data);
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
      }
    }
  }, [videoReady, scanning, handleScanQR]);

  useEffect(() => {
    if (videoReady) {
      // Scan more frequently for better QR detection (every 300ms)
      scanningIntervalRef.current = setInterval(captureFrame, 300);
    }
    return () => {
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
      }
    };
  }, [videoReady, captureFrame]);

  const handleCheckTicket = async () => {
    // For testing: simulate a valid ticket scan
    const testQRData = 'TEST_TICKET_' + Date.now();
    await handleScanQR(testQRData);
  };

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

        {error && (
          <div className="scanner-error">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{error}</div>
          </div>
        )}

        {scanning && (
          <div className="scanner-status">
            <div className="status-text">Validating ticket...</div>
          </div>
        )}

        <div className="scanner-controls">
          <button
            className="btn-flashlight"
            onClick={toggleFlashlight}
            title="Toggle Flashlight"
          >
            {flashlightOn ? '🔦 Flashlight On' : '🔦 Toggle Flashlight'}
          </button>

          <button
            className="btn-check-ticket"
            onClick={handleCheckTicket}
            disabled={scanning}
          >
            {scanning ? 'Checking...' : 'Test Scan'}
          </button>
        </div>

        <div className="scanner-instructions">
          <p>Point camera at QR code to scan automatically</p>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
