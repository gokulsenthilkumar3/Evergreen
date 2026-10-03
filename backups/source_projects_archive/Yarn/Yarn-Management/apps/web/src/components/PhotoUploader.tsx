import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { http } from '../lib/http';

interface PhotoUploaderProps {
    value: string[];
    onChange: (urls: string[]) => void;
    maxFiles?: number;
}

export default function PhotoUploader({ value = [], onChange, maxFiles = 10 }: PhotoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = maxFiles - value.length;
        if (remainingSlots <= 0) {
            alert(`Maximum ${maxFiles} photos allowed`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);

        // Validate file types and sizes
        const validFiles = filesToUpload.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} is larger than 5MB`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        try {
            const formData = new FormData();
            validFiles.forEach(file => formData.append('photos', file));

            const response = await http.post('/quality-control/upload-photos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const newUrls = response.data.photoUrls;
            onChange([...value, ...newUrls]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to upload photos');
        } finally {
            setUploading(false);
        }
    }, [value, onChange, maxFiles]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    }, [handleFiles]);

    const removePhoto = useCallback((index: number) => {
        const newUrls = value.filter((_, i) => i !== index);
        onChange(newUrls);
    }, [value, onChange]);

    return (
        <div className="photo-uploader">
            {value.length > 0 && (
                <div className="photo-grid">
                    {value.map((url, index) => (
                        <div key={index} className="photo-item">
                            <img src={url} alt={`Upload ${index + 1}`} />
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removePhoto(index)}
                                title="Remove photo"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {value.length < maxFiles && (
                <div
                    className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        id="photo-input"
                        multiple
                        accept="image/*"
                        onChange={handleFileInput}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="photo-input" className="upload-label">
                        {uploading ? (
                            <>
                                <div className="spinner" />
                                <p>Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload size={32} />
                                <p>Drag and drop photos here or click to browse</p>
                                <span className="upload-hint">
                                    Max {maxFiles} photos, 5MB each (JPEG, PNG, WebP)
                                </span>
                            </>
                        )}
                    </label>
                </div>
            )}

            <style>{`
        .photo-uploader {
          width: 100%;
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .photo-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
        }

        .photo-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .remove-btn:hover {
          background: rgba(220, 38, 38, 1);
        }

        .upload-zone {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          transition: all 0.2s;
          background: #f9fafb;
        }

        .upload-zone.drag-active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .upload-zone.uploading {
          opacity: 0.6;
          pointer-events: none;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          color: #6b7280;
        }

        .upload-label:hover {
          color: #3b82f6;
        }

        .upload-label p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }

        .upload-hint {
          font-size: 12px;
          color: #9ca3af;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
