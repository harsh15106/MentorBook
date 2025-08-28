// src/pages/teacher/views/TeacherHomeView.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import './TeacherHomeView.css';

const TeacherHomeView = ({ currentUser, userData }) => {
    const [appointments, setAppointments] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA FROM FIRESTORE ---
    useEffect(() => {
        if (!currentUser?.uid) return;

        setLoading(true);

        // Listener for appointments for this teacher
        const appointmentsQuery = query(
            collection(db, "appointments"),
            where("teacherId", "==", currentUser.uid)
        );
        const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
            const fetchedAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAppointments(fetchedAppointments);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching teacher appointments:", error);
            setLoading(false);
        });

        // Listener for unread messages for this teacher
        const messagesQuery = query(
            collection(db, 'messages'),
            where('recipientId', '==', currentUser.uid),
            where('read', '==', false)
        );
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            setUnreadMessages(snapshot.size);
        }, (error) => {
            console.error("Error fetching unread messages:", error);
        });

        // Cleanup function to unsubscribe from listeners
        return () => {
            unsubscribeAppointments();
            unsubscribeMessages();
        };
    }, [currentUser]);

    // --- DERIVED DATA FOR DISPLAY ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments
        .filter(appt => appt.date && appt.date.toDate() >= today)
        .sort((a, b) => a.date.toDate() - b.date.toDate());
    
    const userName = userData ? userData.FirstName : "Teacher";

    const formatDate = (firestoreTimestamp) => {
        if (!firestoreTimestamp) return 'No date';
        return firestoreTimestamp.toDate().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="dashboard-view">
            <h1>Welcome, {userName}!</h1>
            <p>Here’s what’s happening with your mentorship schedule.</p>

            <div className="summary-cards-grid">
                <div className="summary-card">
                    <div className="card-icon"><span className="material-symbols-outlined">mail</span></div>
                    <div className="card-info">
                        <span className="card-value">{loading ? '...' : unreadMessages}</span>
                        <span className="card-title">Unread Messages</span>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="card-icon"><span className="material-symbols-outlined">pending_actions</span></div>
                    <div className="card-info">
                        <span className="card-value">{loading ? '...' : upcomingAppointments.length}</span>
                        <span className="card-title">Upcoming Appointments</span>
                    </div>
                </div>
            </div>

            <div className="appointments-list-container">
                <h2>Upcoming Appointments</h2>
                {loading ? (
                    <p>Loading appointments...</p>
                ) : upcomingAppointments.length > 0 ? (
                    <ul className="appointments-list">
                        {upcomingAppointments.slice(0, 4).map(appt => (
                            <li key={appt.id} className="appointment-item">
                                <div className="appointment-details">
                                    <span className="appointment-subject">{appt.subject || 'Mentorship Session'}</span>
                                    <span className="appointment-teacher">with {appt.studentName}</span>
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

export default TeacherHomeView;
