import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';

export const LiveCameraModal: React.FC<{
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      setErrorMsg(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access not supported on this browser/device.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        currentStream = mediaStream;

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn('Camera error, trying fallback facingMode:', err);
        // Fallback without strict facingMode
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          currentStream = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
        } catch (fallbackErr: any) {
          setErrorMsg(fallbackErr?.message || 'Unable to access camera. Please allow camera permissions.');
        }
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 200 }}>
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '520px', 
          background: '#090d16', 
          color: 'white', 
          borderRadius: '24px',
          padding: '20px' 
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', color: 'white' }}>Live Camera Viewfinder</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Works on Laptop Webcam, Tablet & Mobile</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Viewfinder Container */}
        <div style={{ position: 'relative', width: '100%', height: '320px', background: '#000', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {errorMsg ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
              <AlertCircle size={32} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: '13px', fontWeight: 700 }}>{errorMsg}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 4 }}>Check camera permissions in browser address bar</div>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured Snap" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} 
            />
          )}

          {/* Live Camera Grid Lines Overlay */}
          {!capturedImage && !errorMsg && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: '2px dashed rgba(255,255,255,0.2)', borderRadius: '16px', margin: '16px' }} />
          )}
        </div>

        {/* Camera Controls Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={toggleCamera}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={16} />
                Flip Camera
              </button>

              <button
                type="button"
                onClick={handleSnap}
                disabled={!!errorMsg}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '4px solid white',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: errorMsg ? 0.5 : 1
                }}
                title="Snap Photo"
              >
                <Camera size={28} color="white" />
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button
                type="button"
                onClick={handleRetake}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Check size={18} />
                Use This Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
