// src/pages/student/views/HomeView.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase'; // Adjust path if needed
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import './HomeView.css';

// The component now accepts userData and currentUser for dynamic content
const HomeView = ({ appointments, loading: loadingAppointments, userData, currentUser }) => {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [availableTeachers, setAvailableTeachers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // --- FETCH STATS FROM FIRESTORE ---
  // This effect sets up real-time listeners for teachers and messages
  useEffect(() => {
    setLoadingStats(true);

    // --- FIX: Query the 'users' collection and filter by role ---
    const teachersQuery = query(
      collection(db, 'users'), 
      where('role', '==', 'teacher')
    );
    const unsubscribeTeachers = onSnapshot(teachersQuery, (snapshot) => {
      setAvailableTeachers(snapshot.size); // Get the total number of documents
    }, (error) => {
      console.error("Error fetching teachers count:", error);
      // NOTE: Check the browser console for a link to create a Firestore index if you see an error here.
    });

    // 2. Listener for Unread Messages
    // This requires the currentUser prop to be passed down
    let unsubscribeMessages;
    if (currentUser?.uid) {
      const messagesQuery = query(
        collection(db, 'messages'), // Assuming a 'messages' collection
        where('recipientId', '==', currentUser.uid),
        where('read', '==', false)
      );
      unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        setUnreadMessages(snapshot.size);
      }, (error) => {
        console.error("Error fetching unread messages:", error);
      });
    }
    
    // Set loading to false once initial data (or lack thereof) is established
    setLoadingStats(false);

    // Cleanup function to unsubscribe from listeners on component unmount
    return () => {
      unsubscribeTeachers();
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [currentUser]); // Rerun if the user changes

  // --- FIX: Normalize today's date to midnight for accurate comparison ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

  const upcomingAppointments = appointments
    .filter(appt => appt.date && appt.date.toDate() >= today) // Compare against the start of today
    .sort((a, b) => a.date.toDate() - b.date.toDate());

  // Use the user's first name from the userData prop
  const user = userData ? userData.FirstName : "Student";

  // Helper function to format dates safely
  const formatDate = (firestoreTimestamp) => {
    if (firestoreTimestamp && typeof firestoreTimestamp.toDate === 'function') {
      return firestoreTimestamp.toDate().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
    }
    return 'Invalid Date';
  };

  return (
    <div className="dashboard-view">
      <h1>Welcome, {user}!</h1>
      <p>Here is a quick summary of your academic activities.</p>

      {/* --- UPDATED: Summary Cards Section with Live Data --- */}
      <div className="summary-cards-grid">
        <div className="summary-card">
          <div className="card-icon"><span className="material-symbols-outlined">calendar_month</span></div>
          <div className="card-info">
            <span className="card-value">{loadingAppointments ? '...' : upcomingAppointments.length}</span>
            <span className="card-title">Upcoming Appointments</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon"><span className="material-symbols-outlined">mail</span></div>
          <div className="card-info">
            <span className="card-value">{loadingStats ? '...' : unreadMessages}</span>
            <span className="card-title">Unread Messages</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon"><span className="material-symbols-outlined">group</span></div>
          <div className="card-info">
            <span className="card-value">{loadingStats ? '...' : availableTeachers}</span>
            <span className="card-title">Available Teachers</span>
          </div>
        </div>
      </div>

      {/* --- UPDATED: Upcoming Appointments Section with Correct Date Formatting --- */}
      <div className="appointments-list-container">
        <h2>Upcoming Appointments</h2>
        {loadingAppointments ? (
          <p>Loading appointments...</p>
        ) : upcomingAppointments.length > 0 ? (
          <ul className="appointments-list">
            {upcomingAppointments.slice(0, 3).map(appt => ( // Show first 3
              <li key={appt.id} className="appointment-item">
                <div className="appointment-details">
                  <span className="appointment-subject">{appt.subject || 'Mentorship Session'}</span>
                  <span className="appointment-teacher">with {appt.teacherName}</span>
                </div>
                <div className="appointment-time">
                  <span className="material-symbols-outlined">schedule</span>
                  {formatDate(appt.date)} at {appt.time}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no upcoming appointments.</p>
        )}
      </div>
    </div>
  );
};

export default HomeView;
