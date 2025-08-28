// src/pages/teacher/views/ScheduleView.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot, updateDoc } from 'firebase/firestore';
import RejectAppointmentModal from '../../../components/RejectAppointmentModal'; // Import the new modal
import './ScheduleView.css';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const ScheduleView = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [schedule, setSchedule] = useState({});
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [confirmedAppointments, setConfirmedAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [appointmentToReject, setAppointmentToReject] = useState(null);
    const teacherId = auth.currentUser?.uid;

    useEffect(() => {
        if (!teacherId) {
            setLoading(false);
            return;
        }

        // Fetch weekly availability
        const scheduleDocRef = doc(db, 'teacherSchedules', teacherId);
        getDoc(scheduleDocRef).then(docSnap => {
            if (docSnap.exists()) {
                setSchedule(docSnap.data().availability || {});
            }
        });

        // Listen for PENDING appointments
        const pendingQuery = query(collection(db, 'appointments'), where('teacherId', '==', teacherId), where('status', '==', 'pending'));
        const unsubPending = onSnapshot(pendingQuery, snap => {
            const appointments = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.date.toDate() - b.date.toDate());
            setPendingAppointments(appointments);
        });

        // Listen for CONFIRMED (upcoming) appointments
        const confirmedQuery = query(collection(db, 'appointments'), where('teacherId', '==', teacherId), where('status', '==', 'upcoming'));
        const unsubConfirmed = onSnapshot(confirmedQuery, snap => {
            const appointments = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.date.toDate() - b.date.toDate());
            setConfirmedAppointments(appointments);
            setLoading(false);
        });

        return () => {
            unsubPending();
            unsubConfirmed();
        };
    }, [teacherId]);

    const handleOpenRejectModal = (appointment) => {
        setAppointmentToReject(appointment);
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = async (reason) => {
        if (!appointmentToReject) return;
        const appointmentRef = doc(db, 'appointments', appointmentToReject.id);
        try {
            await updateDoc(appointmentRef, { 
                status: 'rejected',
                rejectionReason: reason 
            });
        } catch (error) {
            console.error("Error rejecting appointment:", error);
        } finally {
            setIsRejectModalOpen(false);
            setAppointmentToReject(null);
        }
    };

    const handleConfirmAppointment = async (appointmentId) => {
        const appointmentRef = doc(db, 'appointments', appointmentId);
        await updateDoc(appointmentRef, { status: 'upcoming' });
    };

    const toggleTimeSlot = (day, time) => {
        setSchedule(prev => {
            const daySlots = prev[day] ? [...prev[day]] : [];
            const index = daySlots.indexOf(time);
            if (index > -1) {
                daySlots.splice(index, 1);
            } else {
                daySlots.push(time);
            }
            daySlots.sort();
            return { ...prev, [day]: daySlots };
        });
    };

    const handleSaveSchedule = async () => {
        if (!teacherId) return;
        setIsSaving(true);
        try {
            await setDoc(doc(db, 'teacherSchedules', teacherId), { availability: schedule }, { merge: true });
            alert('Schedule updated successfully!');
        } catch (error) {
            alert('Failed to save schedule.');
        }
        setIsSaving(false);
    };

    const formatDate = (ts) => ts?.toDate().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) || 'N/A';

    if (loading) {
        return <div className="loading-message">Loading schedule...</div>;
    }

    return (
        <div className="dashboard-view schedule-view">
            <RejectAppointmentModal 
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onSubmit={handleRejectSubmit}
            />
            <div className="schedule-header">
                <h1>My Schedule</h1>
                <p>Manage your availability and appointment requests.</p>
            </div>
            <div className="schedule-tabs">
                <button className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>Requests ({pendingAppointments.length})</button>
                <button className={`tab-button ${activeTab === 'confirmed' ? 'active' : ''}`} onClick={() => setActiveTab('confirmed')}>Confirmed ({confirmedAppointments.length})</button>
                <button className={`tab-button ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>Set Availability</button>
            </div>

            {activeTab === 'requests' && (
                <div className="appointments-list-section">
                    {pendingAppointments.length > 0 ? pendingAppointments.map(appt => (
                        <div key={appt.id} className="appointment-card-schedule request">
                            <div className="card-main-info">
                                <span className="card-subject">{appt.subject}</span>
                                <span className="card-student">with {appt.studentName} on {formatDate(appt.date)} at {appt.time}</span>
                            </div>
                            <div className="card-actions">
                                <button className="action-btn reject" onClick={() => handleOpenRejectModal(appt)}>Reject</button>
                                <button className="action-btn confirm" onClick={() => handleConfirmAppointment(appt.id)}>Confirm</button>
                            </div>
                        </div>
                    )) : <p className="no-appointments-message">No pending appointment requests.</p>}
                </div>
            )}

            {activeTab === 'confirmed' && (
                 <div className="appointments-list-section">
                    {confirmedAppointments.length > 0 ? confirmedAppointments.map(appt => (
                        <div key={appt.id} className="appointment-card-schedule confirmed">
                            <div className="card-main-info">
                                <span className="card-subject">{appt.subject}</span>
                                <span className="card-student">with {appt.studentName}</span>
                            </div>
                            <div className="card-time-info">
                                <span>{formatDate(appt.date)}</span>
                                <span>{appt.time}</span>
                            </div>
                        </div>
                    )) : <p className="no-appointments-message">No confirmed appointments.</p>}
                </div>
            )}

            {activeTab === 'availability' && (
                <div className="availability-section">
                    <div className="schedule-grid">
                        {daysOfWeek.map(day => (
                            <div key={day} className="day-column">
                                <h3>{day}</h3>
                                <div className="time-slots-container">
                                    {timeSlots.map(time => (<button key={time} className={`time-slot-btn ${schedule[day]?.includes(time) ? 'selected' : ''}`} onClick={() => toggleTimeSlot(day, time)}>{time}</button>))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="schedule-actions"><button onClick={handleSaveSchedule} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Schedule'}</button></div>
                </div>
            )}
        </div>
    );
};

export default ScheduleView;
