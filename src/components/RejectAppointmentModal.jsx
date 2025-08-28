// src/components/RejectAppointmentModal.jsx

import React, { useState } from 'react';
import './RejectAppointmentModal.css';

const RejectAppointmentModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }
        onSubmit(reason);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Reject Appointment</h2>
                <p>Please provide a brief reason for rejecting this appointment request.</p>
                <form onSubmit={handleSubmit} className="rejection-form">
                    <textarea 
                        placeholder="e.g., I am unavailable at this time due to a prior commitment."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                    <button type="submit" className="submit-rejection-button">Submit Rejection</button>
                </form>
            </div>
        </div>
    );
};

export default RejectAppointmentModal;
