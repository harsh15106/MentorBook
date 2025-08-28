// src/components/Toast.jsx

import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type, onClose }) => {
  // Automatically close the toast after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    // Cleanup the timer if the component is unmounted
    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);

  const icons = {
    success: 'check_circle',
    error: 'error',
  };

  return (
    <div className={`toast-container ${type}`}>
      <span className="material-symbols-outlined toast-icon">{icons[type]}</span>
      <p className="toast-message">{message}</p>
      <button onClick={onClose} className="toast-close-button">
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
};

export default Toast;
