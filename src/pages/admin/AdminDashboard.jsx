// src/pages/admin/AdminDashboard.jsx

import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AddTeacherView from './views/AddTeacherView.jsx';
import ViewTeachersView from './views/ViewTeachersView.jsx';
import Toast from '../../components/Toast.jsx'; // Import the Toast component
import './AdminDashboard.css';

const AdminSidebar = () => {
    const navigate = useNavigate();
    return (
        <aside className="admin-sidebar">
            <div className="admin-sidebar-header">
                <h3>Admin Panel</h3>
            </div>
            <nav className="admin-nav">
                <button onClick={() => navigate('/admin/add-teacher')}>Add Teacher</button>
                <button onClick={() => navigate('/admin/view-teachers')}>View Teachers</button>
            </nav>
        </aside>
    );
};

const AdminDashboard = () => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Function to trigger the toast notification
    const triggerToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            <main className="admin-main-content">
                <Routes>
                    {/* Pass the triggerToast function as a prop to the AddTeacherView */}
                    <Route index element={<AddTeacherView triggerToast={triggerToast} />} />
                    <Route path="add-teacher" element={<AddTeacherView triggerToast={triggerToast} />} />
                    <Route path="view-teachers" element={<ViewTeachersView />} />
                </Routes>
            </main>
            {/* Conditionally render the Toast component */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
