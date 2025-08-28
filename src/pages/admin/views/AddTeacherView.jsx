// src/pages/admin/views/AddTeacherView.jsx

import React, { useState } from 'react';
import { db, auth } from '../../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './AddTeacherView.css';

// The component now accepts the triggerToast function as a prop
const AddTeacherView = ({ triggerToast }) => {
    const [fullName, setFullName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [subjects, setSubjects] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newTeacher = userCredential.user;

            await setDoc(doc(db, 'users', newTeacher.uid), {
                fullName,
                surname,
                email,
                city,
                state,
                country,
                subjects: subjects.split(',').map(s => s.trim()),
                role: 'teacher',
                createdAt: new Date(),
            });

            // --- EDIT: Use the toast notification for success ---
            triggerToast('Teacher added successfully!', 'success');
            
            // Reset form
            setFullName('');
            setSurname('');
            setEmail('');
            setPassword('');
            setCity('');
            setState('');
            setCountry('');
            setSubjects('');

        } catch (err) {
            // --- EDIT: Use the toast notification for errors ---
            triggerToast(err.message.replace('Firebase: ', ''), 'error');
            console.error("Error adding teacher: ", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-teacher-view">
            <h1>Add New Teacher</h1>
            <p>Create a new teacher account and set their initial login credentials.</p>
            <form onSubmit={handleAddTeacher} className="add-teacher-form">
                <div className="form-section">
                    <h3>Personal Details</h3>
                    <div className="form-row">
                        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        <input type="text" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                    </div>
                    <div className="form-row">
                        <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                        <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
                    </div>
                    <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>

                <div className="form-section">
                    <h3>Login Credentials & Subjects</h3>
                    <input type="email" placeholder="Email Address (for login)" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required />
                    <input type="password" placeholder="Initial Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <input type="text" placeholder="Subjects (comma-separated, e.g., Maths, Physics)" value={subjects} onChange={(e) => setSubjects(e.target.value)} required />
                </div>
                
                {/* Static success/error messages are no longer needed */}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding Teacher...' : 'Add Teacher'}
                </button>
            </form>
        </div>
    );
};

export default AddTeacherView;
