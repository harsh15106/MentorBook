// src/components/StudentDetailsModal.jsx

import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import './StudentDetailsModal.css';

const StudentDetailsModal = ({ userId, onClose }) => {
    const [educationLevel, setEducationLevel] = useState('');
    const [formData, setFormData] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!educationLevel) {
            alert('Please select your education level.');
            return;
        }

        try {
            let collectionName = '';
            if (educationLevel === 'college') collectionName = 'collegeStudents';
            else if (educationLevel === 'school') collectionName = 'schoolStudents';
            else if (educationLevel === 'dropper') collectionName = 'dropperStudents';
            
            await setDoc(doc(db, collectionName, userId), {
                ...formData,
                userId,
                updatedAt: new Date()
            });

            alert('Details saved successfully!');
            onClose();

        } catch (error) {
            console.error("Error saving student details: ", error);
            alert('Failed to save details. Please try again.');
        }
    };

    const renderFormFields = () => {
        if (educationLevel === 'college') {
            return (
                <>
                    <input id="collegeName" name="collegeName" placeholder="Name of College" onChange={handleInputChange} required />
                    <div className="form-row">
                        <input id="collegeCity" name="city" placeholder="City" onChange={handleInputChange} required />
                        <input id="collegeState" name="state" placeholder="State" onChange={handleInputChange} required />
                    </div>
                    <div className="form-row">
                        <input id="degree" name="degree" placeholder="Degree (e.g., B.Tech)" onChange={handleInputChange} required />
                        <input id="course" name="course" placeholder="Course (e.g., CSE)" onChange={handleInputChange} required />
                    </div>
                    <input id="passingYear" name="passingYear" type="number" placeholder="Year of Passing" onChange={handleInputChange} required />
                </>
            );
        }
        if (educationLevel === 'school') {
            return (
                <>
                    <input id="schoolName" name="schoolName" placeholder="School Name" onChange={handleInputChange} required />
                    <div className="form-row">
                        <input id="schoolCity" name="city" placeholder="City" onChange={handleInputChange} required />
                        <input id="schoolState" name="state" placeholder="State" onChange={handleInputChange} required />
                    </div>
                    <div className="form-row">
                        <input id="class" name="class" placeholder="Class (e.g., 12th)" onChange={handleInputChange} required />
                        <input id="stream" name="stream" placeholder="Stream (e.g., Science)" onChange={handleInputChange} required />
                    </div>
                </>
            );
        }
        return null;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Complete Your Profile</h2>
                <p>Please provide a few more details to get started.</p>
                <form onSubmit={handleSubmit} className="details-form">
                    <select id="educationLevel" name="educationLevel" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} required>
                        <option value="">Select Education Level...</option>
                        <option value="college">Currently in College</option>
                        <option value="school">Currently in School</option>
                        <option value="dropper">Dropper</option>
                    </select>
                    {renderFormFields()}
                    {educationLevel && <button type="submit">Save Details</button>}
                </form>
            </div>
        </div>
    );
};

export default StudentDetailsModal;
