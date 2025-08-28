// src/pages/student/StudentDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import SNavbar from '../../components/SNavbar.jsx';
import Toast from '../../components/Toast.jsx';
import StudentDetailsModal from '../../components/StudentDetailsModal.jsx';
import { db, auth } from '../../firebase.js';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, getDoc, collectionGroup } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import './StudentDashboard.css';

// --- Import View Components ---
import HomeView from './views/HomeView.jsx';
import SearchTeacherView from './views/SearchTeacherView.jsx';
import TeacherProfileView from './views/TeacherProfileView.jsx';
import BookingView from './views/BookingView.jsx';
import AppointmentsView from './views/AppointmentsView.jsx';
import MessageView from './views/MessageView.jsx';
import MyProfileView from './views/MyProfileView.jsx';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // State for unread messages

  useEffect(() => {
    if (location.state?.showDetailsModal && currentUser) {
      setShowModal(true);
    }
  }, [location.state, currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = { id: userDoc.id, ...userDoc.data() };
          setUserData(data);
          const initials = `${data.fullName?.charAt(0) || ''}${data.surname?.charAt(0) || ''}`;
          setProfilePic(`https://placehold.co/60x60/E8F0FE/3367D6?text=${initials}`);
        } else {
          navigate('/auth');
        }
      } else {
        navigate('/auth');
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- New Effect: Listen for total unread messages ---
  useEffect(() => {
    if (!currentUser?.uid) return;

    // This is a collection group query that looks across all 'messages' sub-collections.
    const unreadQuery = query(
      collectionGroup(db, 'messages'),
      where('recipientId', '==', currentUser.uid),
      where('isRead', '==', false)
    );

    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    // Note: This query requires a Firestore index. The console will provide a link to create it.
    return () => unsubscribe();
  }, [currentUser]);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [bookingTeacher, setBookingTeacher] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  useEffect(() => {
    if (!currentUser?.uid) return;
    setLoadingAppointments(true);
    const appointmentsQuery = query(collection(db, 'appointments'), where('studentId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(appointmentsQuery, (querySnapshot) => {
      const fetchedAppointments = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(fetchedAppointments);
      setLoadingAppointments(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleViewProfile = (teacher) => setSelectedTeacher(teacher);
  const handleBackToSearch = () => {
    setSelectedTeacher(null);
    navigate('/student/search');
  };
  const handleBookAppointment = (teacher) => setBookingTeacher(teacher);
  const handleBackToProfile = () => setBookingTeacher(null);
  const handleProfileClick = () => {
    setSelectedTeacher(null);
    setBookingTeacher(null);
    navigate('/student/profile');
  };
  const handleNavClick = (path) => {
    setSelectedTeacher(null);
    setBookingTeacher(null);
    navigate(path);
  };
  const triggerToast = (message, type = 'success') => setToast({ show: true, message, type });

  const createAppointment = async (appointmentDetails) => {
    if (!currentUser?.uid || !bookingTeacher?.id || !userData) {
      triggerToast('Cannot create appointment. User or teacher is missing.', 'error');
      return;
    }
    try {
      await addDoc(collection(db, 'appointments'), {
        studentId: currentUser.uid,
        teacherId: bookingTeacher.id,
        studentName: `${userData.fullName} ${userData.surname}`,
        teacherName: `${bookingTeacher.fullName} ${bookingTeacher.surname}`,
        ...appointmentDetails,
        createdAt: serverTimestamp()
      });
      triggerToast('Appointment request sent successfully!', 'success');
      setBookingTeacher(null);
    } catch (error) {
      console.error("Error creating appointment: ", error);
      triggerToast('Failed to send request. Please try again.', 'error');
    }
  };

  if (loadingAuth || !userData) {
    return <div className="loading-fullscreen">Loading Dashboard...</div>;
  }

  let mainContent;
  if (bookingTeacher) {
    mainContent = <BookingView teacher={bookingTeacher} onBack={handleBackToProfile} triggerToast={triggerToast} onCreateAppointment={createAppointment} />;
  } else if (selectedTeacher) {
    mainContent = <TeacherProfileView teacher={selectedTeacher} onBack={handleBackToSearch} onBookAppointment={handleBookAppointment} />;
  } else {
    mainContent = (
      <Routes>
        <Route index element={<HomeView appointments={appointments} loading={loadingAppointments} userData={userData} currentUser={currentUser} />} />
        <Route path="home" element={<HomeView appointments={appointments} loading={loadingAppointments} userData={userData} currentUser={currentUser} />} />
        <Route path="search" element={<SearchTeacherView onViewProfile={handleViewProfile} userData={userData} />} />
        <Route path="appointments" element={<AppointmentsView appointments={appointments} loading={loadingAppointments} />} />
        <Route path="message" element={<MessageView />} />
        <Route 
            path="profile" 
            element={
                <MyProfileView 
                    userData={userData} 
                    profilePic={profilePic} 
                    setProfilePic={setProfilePic}
                />
            } 
        />
      </Routes>
    );
  }

  return (
    <div className="student-dashboard-layout">
      {showModal && <StudentDetailsModal userId={currentUser.uid} onClose={() => setShowModal(false)} />}
      <SNavbar
        onProfileClick={handleProfileClick}
        userData={userData}
        onNavClick={handleNavClick}
        profilePic={profilePic}
        unreadCount={unreadCount}
      />
      <main className="dashboard-main-content">{mainContent}</main>
      {toast.show && (<Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false, message: '', type: 'success' })} />)}
    </div>
  );
};

export default StudentDashboard;
