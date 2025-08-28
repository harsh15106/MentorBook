// src/pages/student/views/TeacherProfileView.jsx

import React from 'react';
import './TeacherProfileView.css';

const TeacherProfileView = ({ teacher, onBack, onBookAppointment }) => {
  if (!teacher) {
    return (
      <div className="dashboard-view">
        <h1>Teacher Not Found</h1>
        <button onClick={onBack} className="back-button">
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="profile-view-container">
      <button onClick={onBack} className="back-button">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Search
      </button>

      <header className="profile-header">
        <img 
          src={`https://placehold.co/150x150/667eea/ffffff?text=${teacher.fullName?.charAt(0) || 'N'}${teacher.surname?.charAt(0) || 'A'}`} 
          alt={`${teacher.fullName} ${teacher.surname}`}
          className="profile-avatar-large"
        />
        <div className="profile-header-info">
          <h1>{teacher.fullName} {teacher.surname}</h1>
          <p className="profile-school">{teacher.email?.toLowerCase()}</p>
          <div className="profile-rating">
            <span className="material-symbols-outlined">star</span>
            {/* --- EDIT: Using dynamic rating data --- */}
            <span>{teacher.rating || 'N/A'} ({teacher.reviews || 0} reviews)</span>
          </div>
        </div>
        <button className="book-appointment-button" onClick={() => onBookAppointment(teacher)}>
          Book Appointment
        </button>
      </header>

      <main className="profile-main-content">
        {/* --- Personal Information Section --- */}
        <div className="profile-details-card">
          <h2>Personal Information</h2>
          <div className="profile-display">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{teacher.fullName}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Surname</span>
              <span className="detail-value">{teacher.surname}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location</span>
              <span className="detail-value">{`${teacher.city}, ${teacher.state}`}</span>
            </div>
          </div>
        </div>

        {/* --- Professional Information Section --- */}
        <div className="profile-details-card">
          <h2>Professional Information</h2>
          <div className="profile-display">
            <div className="detail-item">
              <span className="detail-label">Subjects</span>
              <span className="detail-value">{teacher.subjects?.join(', ') || 'Not Specified'}</span>
            </div>
             <div className="detail-item">
              <span className="detail-label">Experience</span>
              {/* --- EDIT: Using dynamic experience data --- */}
              <span className="detail-value">{teacher.experience || 'Not Specified'}</span>
            </div>
             <div className="detail-item">
              <span className="detail-label">Qualifications</span>
              {/* --- EDIT: Using dynamic qualifications data --- */}
              <span className="detail-value">{teacher.qualifications || 'Not Specified'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherProfileView;
