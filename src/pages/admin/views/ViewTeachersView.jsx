// src/pages/admin/views/ViewTeachersView.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './ViewTeachersView.css';

const ViewTeachersView = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeachers = async () => {
            setLoading(true);
            try {
                const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
                const querySnapshot = await getDocs(teachersQuery);
                const teachersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTeachers(teachersList);
            } catch (err) {
                console.error("Error fetching teachers: ", err);
                setError('Failed to fetch teachers.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    if (loading) {
        return <div className="loading-message">Loading teachers...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="view-teachers-container">
            <h1>All Teachers</h1>
            <p>A complete list of all registered teachers on the platform.</p>
            <div className="teacher-table-wrapper">
                <table className="teacher-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Location</th>
                            <th>Subjects</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map(teacher => (
                            <tr key={teacher.id}>
                                <td>{teacher.fullName} {teacher.surname}</td>
                                <td>{teacher.email}</td>
                                <td>{`${teacher.city}, ${teacher.state}`}</td>
                                <td>{teacher.subjects?.join(', ') || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewTeachersView;
