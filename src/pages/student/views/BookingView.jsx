// src/pages/student/views/BookingView.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import Calendar from '../../../components/Calendar.jsx';
import './BookingView.css';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- EDIT: The component now accepts the triggerToast function ---
const BookingView = ({ teacher, onBack, onCreateAppointment, triggerToast }) => {
  const teacherSubjects = teacher.subjects || teacher.Subjects || [];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [meetingType, setMeetingType] = useState('Online');
  const [selectedSubject, setSelectedSubject] = useState(teacherSubjects[0] || '');
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    if (!teacher || !selectedDate) return;

    const fetchAvailability = async () => {
      setLoadingSlots(true);
      setSelectedTime(null);

      try {
        const scheduleDocRef = doc(db, 'teacherSchedules', teacher.id);
        const scheduleSnap = await getDoc(scheduleDocRef);
        const weeklyAvailability = scheduleSnap.exists() ? scheduleSnap.data().availability : {};
        
        const dayOfWeek = daysOfWeek[selectedDate.getDay()];
        const daySlots = weeklyAvailability[dayOfWeek] || [];

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('teacherId', '==', teacher.id),
          where('date', '>=', Timestamp.fromDate(startOfDay)),
          where('date', '<=', Timestamp.fromDate(endOfDay))
        );
        
        const appointmentSnap = await getDocs(appointmentsQuery);
        const bookedTimes = appointmentSnap.docs.map(d => d.data().time);

        const finalSlots = daySlots.filter(slot => !bookedTimes.includes(slot));
        setAvailableSlots(finalSlots);

      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, [teacher, selectedDate]);

  const handleBooking = () => {
    if (!selectedTime || !selectedSubject) {
      // --- EDIT: Replaced alert with the triggerToast function ---
      triggerToast("Please select a subject and time slot.", "error");
      return;
    }
    
    const appointmentDetails = {
      subject: selectedSubject,
      date: selectedDate,
      time: selectedTime,
      meetingType: meetingType,
      status: 'pending',
    };

    onCreateAppointment(appointmentDetails);
  };

  return (
    <div className="booking-view-container">
      <button onClick={onBack} className="back-button">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Profile
      </button>

      <h1>Book an Appointment</h1>
      <p>Select a date and time to meet with <strong>{teacher.fullName} {teacher.surname}</strong>.</p>

      <div className="booking-layout">
        <div className="calendar-wrapper">
          <Calendar 
            selectedDate={selectedDate} 
            onDateSelect={setSelectedDate} 
          />
        </div>

        <div className="time-slots-container">
          <h2 className="section-title">1. Select a Subject</h2>
           <div className="subject-select-wrapper">
             <select className="subject-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
               {teacherSubjects.map(subject => (<option key={subject} value={subject}>{subject}</option>))}
             </select>
           </div>
          <h2 className="section-title">2. Select an Available Time Slot</h2>
          <p className="selected-date-display">For: {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className="time-slots-grid">
            {loadingSlots ? <p>Loading slots...</p> : availableSlots.length > 0 ? (
              availableSlots.map(time => (
                <button key={time} className={`time-slot-button ${selectedTime === time ? 'active' : ''}`} onClick={() => setSelectedTime(time)}>
                  {time}
                </button>
              ))
            ) : (
              <p>No available slots for this day.</p>
            )}
          </div>
          <h2 className="section-title">3. Select Meeting Type</h2>
          <div className="meeting-type-selection">
            <button className={`meeting-type-button ${meetingType === 'Online' ? 'active' : ''}`} onClick={() => setMeetingType('Online')}>
              <span className="material-symbols-outlined">videocam</span> Online
            </button>
            <button className={`meeting-type-button ${meetingType === 'Offline' ? 'active' : ''}`} onClick={() => setMeetingType('Offline')}>
              <span className="material-symbols-outlined">groups</span> Offline
            </button>
          </div>
        </div>
      </div>

      <div className="booking-summary">
        <button className="confirm-booking-button" onClick={handleBooking} disabled={!selectedTime || !selectedSubject}>
          Send Appointment Request
        </button>
      </div>
    </div>
  );
};

export default BookingView;
