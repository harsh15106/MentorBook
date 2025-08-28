// src/pages/teacher/TeacherDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import TNavbar from '../../components/TNavbar.jsx';
import './TeacherDashboard.css';

// --- Import the view components ---
import TeacherHomeView from './views/TeacherHomeView.jsx';
import ScheduleView from './views/ScheduleView.jsx';
import MessagesView from './views/MessagesView.jsx';
import MyProfileView from './views/MyProfileView.jsx';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [profilePic, setProfilePic] = useState(null); // State for profile picture
    const [loading, setLoading] = useState(true);

    // --- Firebase Auth State Listener ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const data = { id: userDoc.id, ...userDoc.data() };
                    setUserData(data);
                    // Set initial profile picture (placeholder logic)
                    const initials = `${data.fullName?.charAt(0) || ''}${data.surname?.charAt(0) || ''}`;
                    setProfilePic(`https://placehold.co/60x60/667eea/ffffff?text=${initials}`);
                } else {
                    console.error("No user data found in Firestore!");
                    navigate('/');
                }
            } else {
                navigate('/');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleProfileClick = () => {
        navigate('/teacher/profile');
    };

    if (loading || !userData) {
        return <div className="loading-fullscreen">Loading Dashboard...</div>;
    }

    return (
        <div className="teacher-dashboard-layout">
            <TNavbar userData={userData} profilePic={profilePic} onProfileClick={handleProfileClick} />
            <main className="dashboard-main-content">
                <Routes>
                    <Route 
                        index 
                        element={<TeacherHomeView currentUser={currentUser} userData={userData} />} 
                    />
                    <Route 
                        path="home" 
                        element={<TeacherHomeView currentUser={currentUser} userData={userData} />} 
                    />
                    <Route path="schedule" element={<ScheduleView />} />
                    <Route path="messages" element={<MessagesView />} />
                    
                    <Route 
                        path="profile" 
                        element={
                            <MyProfileView 
                                userData={userData} 
                                profilePic={profilePic}
                                setProfilePic={setProfilePic} // Pass the setter function
                            />
                        } 
                    />
                </Routes>
            </main>
        </div>
    );
};

export default TeacherDashboard;
