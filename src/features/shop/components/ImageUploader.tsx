import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Trash2, X, RefreshCw, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  id: string;
  value: string; // base64 string or url
  onChange: (base64: string) => void;
  label: string;
  placeholderText?: string;
  shape?: 'circle' | 'rect';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label,
  placeholderText = 'Select Image',
  shape = 'rect',
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      // Release camera tracks on cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch (err: any) {
      console.error('Camera stream error:', err);
      setError('Could not access camera. Try file upload.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = 240;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Center crop to square
        const size = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - size) / 2;
        const sy = (video.videoHeight - size) / 2;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 240, 240);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onChange(dataUrl);
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      
      // Enforce image checks and size cap (max 2MB to keep base64 strings under control)
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be smaller than 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    onChange('');
  };

  const isCircle = shape === 'circle';

  return (
    <div style={styles.container}>
      <label className="input-label">{label}</label>
      
      <div style={styles.uploaderBox}>
        {/* Render Frame */}
        <div style={{
          ...styles.previewArea,
          borderRadius: isCircle ? '50%' : 'var(--radius-md)',
        }}>
          {isCameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.videoStream}
            />
          ) : value ? (
            <img
              src={value}
              alt={label}
              style={styles.previewImage}
            />
          ) : (
            <div style={styles.placeholderContainer}>
              <Upload size={24} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {placeholderText}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={styles.actionsPanel}>
          {isCameraActive ? (
            <div style={styles.btnRow}>
              <button
                type="button"
                onClick={capturePhoto}
                className="btn btn-primary"
                style={styles.smallBtn}
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="btn btn-secondary"
                style={styles.smallBtn}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={styles.btnRow}>
              <button
                type="button"
                onClick={startCamera}
                className="btn btn-outline"
                style={styles.actionBtn}
                title="Use camera"
              >
                <Camera size={14} />
                <span>Camera</span>
              </button>
              
              <button
                type="button"
                onClick={triggerFileSelect}
                className="btn btn-outline"
                style={styles.actionBtn}
                title="Upload file"
              >
                <Upload size={14} />
                <span>Upload</span>
              </button>

              {value && (
                <button
                  type="button"
                  onClick={removePhoto}
                  className="btn btn-outline"
                  style={{ ...styles.actionBtn, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {error && (
            <span style={styles.errorText}>{error}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  } as React.CSSProperties,
  uploaderBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,
  previewArea: {
    width: '80px',
    height: '80px',
    backgroundColor: 'var(--bg-secondary)',
    border: '2px dashed var(--border-color)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,
  placeholderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'center',
    padding: '4px',
  } as React.CSSProperties,
  videoStream: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transform: 'scaleX(-1)',
  } as React.CSSProperties,
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  } as React.CSSProperties,
  actionsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flexGrow: 1,
  } as React.CSSProperties,
  btnRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  smallBtn: {
    padding: '6px 12px',
    fontSize: '0.75rem',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
  actionBtn: {
    padding: '6px 12px',
    fontSize: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: '70px',
    justifyContent: 'center',
  } as React.CSSProperties,
  errorText: {
    fontSize: '0.75rem',
    color: 'var(--danger)',
    fontWeight: '500',
  } as React.CSSProperties,
};
