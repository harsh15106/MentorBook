// src/pages/student/views/AppointmentsView.jsx

import React, { useState } from 'react';
import './AppointmentsView.css';

const AppointmentsView = ({ appointments, loading }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter appointments into their respective categories
  const pendingAppointments = appointments.filter(a => a.status === 'pending').sort((a,b) => a.date.toDate() - b.date.toDate());
  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming' && a.date.toDate() >= today).sort((a,b) => a.date.toDate() - b.date.toDate());
  const rejectedAppointments = appointments.filter(a => a.status === 'rejected').sort((a,b) => b.date.toDate() - a.date.toDate());
  const pastAppointments = appointments.filter(a => a.date.toDate() < today && a.status !== 'rejected' && a.status !== 'pending').sort((a,b) => b.date.toDate() - a.date.toDate());

  const appointmentsToDisplay = 
    activeTab === 'pending' ? pendingAppointments :
    activeTab === 'upcoming' ? upcomingAppointments :
    activeTab === 'rejected' ? rejectedAppointments :
    pastAppointments;

  const formatDate = (ts) => ts?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) || 'N/A';

  return (
    <div className="appointments-view-container">
      <h1>My Appointments</h1>
      <p>Review your appointment requests and scheduled sessions.</p>

      <div className="appointment-tabs">
        <button className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending ({pendingAppointments.length})</button>
        <button className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming ({upcomingAppointments.length})</button>
        <button className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>Rejected ({rejectedAppointments.length})</button>
        <button className={`tab-button ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>Past ({pastAppointments.length})</button>
      </div>

      <div className="appointments-list-full">
        {loading ? <p className="loading-message">Loading appointments...</p> : appointmentsToDisplay.length > 0 ? (
          appointmentsToDisplay.map(appt => (
            <div key={appt.id} className={`appointment-card ${appt.status}`}>
              <div className="card-header">
                <h3>{appt.subject}</h3>
                <span className={`status-badge ${appt.status}`}>{appt.status === 'upcoming' ? 'Approved' : appt.status}</span>
              </div>
              <p className="card-teacher">with {appt.teacherName}</p>
              
              {/* This block will only display if the appointment was rejected and has a reason */}
              {appt.status === 'rejected' && appt.rejectionReason && (
                <div className="rejection-reason-box">
                  <strong>Reason for rejection:</strong>
                  <p>{appt.rejectionReason}</p>
                </div>
              )}

              <div className="card-footer">
                <span className="card-detail"><span className="material-symbols-outlined">calendar_today</span>{formatDate(appt.date)}</span>
                <span className="card-detail"><span className="material-symbols-outlined">schedule</span>{appt.time}</span>
                <span className="card-detail"><span className="material-symbols-outlined">{appt.meetingType === 'Online' ? 'videocam' : 'groups'}</span>{appt.meetingType}</span>
              </div>
            </div>
          ))
        ) : <p className="no-appointments-message">You have no {activeTab} appointments.</p>}
      </div>
    </div>
  );
};

export default AppointmentsView;
