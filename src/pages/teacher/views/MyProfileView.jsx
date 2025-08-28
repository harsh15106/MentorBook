// src/pages/teacher/views/MyProfileView.jsx

import React, { useState } from 'react';
import ImageCropModal from '../../../components/ImageCropModal.jsx';
import './MyProfileView.css';

// It now receives profilePic and setProfilePic from the parent dashboard
const MyProfileView = ({ userData, profilePic, setProfilePic }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImageToCrop(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // When a picture is saved, it updates the state in the parent TeacherDashboard
    const handleSavePicture = () => {
        if (imageToCrop) {
            setProfilePic(imageToCrop); // This updates the state in the parent
        }
        setIsModalOpen(false);
        setImageToCrop(null);
    };

    // When a picture is removed, it also updates the parent's state
    const handleRemovePicture = () => {
        const initials = `${userData.fullName?.charAt(0) || ''}${userData.surname?.charAt(0) || ''}`;
        const fallback = `https://placehold.co/150x150/667eea/ffffff?text=${initials}`;
        setProfilePic(fallback); // Update the parent state to the fallback
        setIsModalOpen(false);
        setImageToCrop(null);
    };

    if (!userData) {
        return <div className="loading-fullscreen">Loading profile...</div>;
    }

    return (
        <div className="profile-view">
            <div className="profile-header-section">
                <button className="profile-picture-button" onClick={() => setIsModalOpen(true)}>
                    {/* The image source now comes directly from the profilePic prop */}
                    <img src={profilePic} alt="Profile" className="profile-main-avatar" />
                    <div className="edit-overlay"><span className="material-symbols-outlined">photo_camera</span></div>
                </button>
                <div className="profile-header-text">
                    <h1>{userData.fullName} {userData.surname}</h1>
                    <p>{userData.email?.toLowerCase()}</p>
                </div>
            </div>

            {/* ... (rest of the profile details sections remain the same) ... */}
            <div className="profile-details-section">
                <h2>Personal Information</h2>
                <div className="profile-display">
                    <div className="detail-item"><span className="detail-label">Full Name</span><span className="detail-value">{userData.fullName}</span></div>
                    <div className="detail-item"><span className="detail-label">Surname</span><span className="detail-value">{userData.surname}</span></div>
                    <div className="detail-item"><span className="detail-label">Email Address</span><span className="detail-value">{userData.email?.toLowerCase()}</span></div>
                    <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{`${userData.city}, ${userData.state}, ${userData.country}`}</span></div>
                </div>
            </div>

            <div className="profile-details-section">
                <h2>Professional Information</h2>
                <div className="profile-display">
                    <div className="detail-item"><span className="detail-label">Primary Subject</span><span className="detail-value">{userData.subject || 'Not Specified'}</span></div>
                    <div className="detail-item"><span className="detail-label">Years of Experience</span><span className="detail-value">{userData.experience || 'Not Specified'}</span></div>
                    <div className="detail-item"><span className="detail-label">Qualifications</span><span className="detail-value">{userData.qualifications || 'Not Specified'}</span></div>
                </div>
            </div>

            <ImageCropModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={imageToCrop || profilePic}
                onSave={handleSavePicture}
                onRemove={handleRemovePicture}
                onFileSelect={handleFileChange} 
            />
        </div>
    );
};

export default MyProfileView;
