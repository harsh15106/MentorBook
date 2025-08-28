// src/components/ImageCropModal.jsx

import React, { useRef } from 'react';
import './ImageCropModal.css';

const ImageCropModal = ({ isOpen, onClose, imageSrc, onSave, onRemove, onFileSelect }) => {
  const fileInputRef = useRef(null);

  if (!isOpen) {
    return null;
  }

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Profile Picture</h2>
          <button className="modal-close-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="cropper-container">
            {imageSrc ? (
              <img src={imageSrc} alt="Profile Preview" className="cropper-image" />
            ) : (
              <div className="no-image-placeholder">
                <span className="material-symbols-outlined">image</span>
                <p>No image selected</p>
              </div>
            )}
          </div>
          <p className="crop-info-text">
            This is a preview. In a real app, you could drag and zoom to crop the image.
          </p>
        </div>
        <div className="modal-footer">
          <button className="remove-button" onClick={onRemove}>
             <span className="material-symbols-outlined">delete</span> Remove
          </button>
          <div className="main-actions">
            <button className="edit-button" onClick={handleEditClick}>
              <span className="material-symbols-outlined">upload_file</span> Upload New
            </button>
            <button className="save-button" onClick={onSave}>
              Save Picture
            </button>
          </div>
        </div>
      </div>
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileSelect}
        style={{ display: 'none' }} 
        accept="image/png, image/jpeg"
      />
    </div>
  );
};

export default ImageCropModal;
