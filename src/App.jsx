// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import AuthModal from './components/AuthModal.jsx';
import Loader from './components/Loader.jsx';
import Footer from './components/Footer.jsx';

import './App.css';

const ProtectedRoute = ({ user, userRole, requiredRole, children }) => {
  if (!user) return <Navigate to="/" replace />;
  if (!userRole) return <Loader />; // Show loader while role is being fetched
  if (userRole !== requiredRole) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current page path

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          setUserRole(role);

          // --- FIX: Centralized redirect logic ---
          // This runs only after a user logs in and their role is confirmed.
          // It only redirects if the user is currently on a public page.
          if (location.pathname === '/' || location.pathname.startsWith('/auth')) {
            if (role === 'student') navigate('/student/home');
            else if (role === 'teacher') navigate('/teacher/home');
            else if (role === 'admin') navigate('/admin');
          }
        } else {
            auth.signOut();
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, location.pathname]); // Re-run if navigation or location changes

  const handleOpenAuthModal = () => setShowAuthModal(true);
  const handleCloseAuthModal = () => setShowAuthModal(false);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="app-container">
      {/* The modal now only needs to know how to close itself. */}
      {showAuthModal && <AuthModal onClose={handleCloseAuthModal} />}
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage onAuthClick={handleOpenAuthModal} />} />
          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute user={user} userRole={userRole} requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/teacher/*" 
            element={
              <ProtectedRoute user={user} userRole={userRole} requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute user={user} userRole={userRole} requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
