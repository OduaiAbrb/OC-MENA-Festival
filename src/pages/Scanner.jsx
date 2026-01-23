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
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningIntervalRef = useRef(null);
  const lastScanRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and has staff permissions
    const checkAuth = async () => {
      if (!api.isAuthenticated()) {
        navigate('/login?redirect=/scanner', { replace: true });
        return;
      }
      
      // Verify user has staff permissions by checking their profile
      try {
        const response = await api.getUserProfile();
        if (!response.success) {
          setAuthError('Failed to verify permissions');
          setTimeout(() => navigate('/login?redirect=/scanner', { replace: true }), 2000);
          return;
        }
        
        const user = response.data;
        if (!user.is_staff) {
          setAuthError('Access denied. Scanner requires staff permissions.');
          setTimeout(() => navigate('/', { replace: true }), 3000);
          return;
        }
        
        setAuthChecking(false);
      } catch (err) {
        setAuthError('Authentication error');
        setTimeout(() => navigate('/login?redirect=/scanner', { replace: true }), 2000);
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (authChecking) return;

    startCamera();
    return () => {
      stopCamera();
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
      }
    };
  }, [authChecking]);

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
      // Use authenticated validate endpoint instead of quick-scan
      const result = await api.validateScan(qrData);
      
      if (result?.success && result?.data?.can_enter) {
        // Valid ticket - navigate to success page
        navigate('/success', { 
          state: { 
            ticketData: result.data,
            checkInTime: new Date().toLocaleString(),
            passType: result.data?.ticket_type || 'N/A',
            holderName: result.data?.owner_name || 'N/A',
            status: result.data?.status || 'VALID'
          } 
        });
      } else {
        // Show specific error message from backend
        const errorMsg = result?.data?.message || result?.error?.message || 'Invalid ticket';
        setError(errorMsg);
        setTimeout(() => setError(''), 4000);
      }
    } catch (err) {
      console.error('Scan error:', err);
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in as staff.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Staff permission required.');
      } else {
        setError('Failed to validate ticket. Check connection.');
      }
      setTimeout(() => setError(''), 4000);
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

  if (authChecking || authError) {
    return (
      <div className="scanner-page">
        <div className="scanner-header">
          <div className="scanner-logo">
            <img src="/logo.png" alt="Festival Logo" className="logo-img" />
          </div>
          <h1 className="scanner-title">Festival Entry Scanner</h1>
        </div>
        <div className="scanner-content">
          <div className="scanner-status">
            {authError ? (
              <div className="scanner-error">
                <div className="error-icon">⚠️</div>
                <div className="error-text">{authError}</div>
                <div className="status-text">Redirecting...</div>
              </div>
            ) : (
              <div className="status-text">Checking authentication...</div>
            )}
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
        </div>

        <div className="scanner-instructions">
          <p>Point camera at QR code to scan automatically</p>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
