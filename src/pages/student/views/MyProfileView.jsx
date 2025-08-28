// src/pages/student/views/MyProfileView.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage"; // Import Firebase Storage
import ImageCropModal from '../../../components/ImageCropModal.jsx';
import './MyProfileView.css';

const MyProfileView = ({ userData, profilePic, setProfilePic }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // To show a loading state on the save button

    useEffect(() => {
        if (!userData || !auth.currentUser) return setLoading(false);
        const fetchAcademicData = async () => {
            setLoading(true);
            const userId = auth.currentUser.uid;
            let academicData = {};
            const collegeDocRef = doc(db, 'collegeStudents', userId);
            const collegeDocSnap = await getDoc(collegeDocRef);
            if (collegeDocSnap.exists()) {
                academicData = { educationLevel: 'College', ...collegeDocSnap.data() };
            } else {
                const schoolDocRef = doc(db, 'schoolStudents', userId);
                const schoolDocSnap = await getDoc(schoolDocRef);
                if (schoolDocSnap.exists()) {
                    academicData = { educationLevel: 'School', ...schoolDocSnap.data() };
                }
            }
            const fullProfile = { ...userData, ...academicData };
            if (fullProfile.profilePicUrl) {
                setProfilePic(fullProfile.profilePicUrl);
            }
            setProfileData(fullProfile);
            setLoading(false);
        };
        fetchAcademicData();
    }, [userData, setProfilePic]);

    // --- EDIT: This function now also opens the modal ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result);
                setIsModalOpen(true); // This ensures the modal opens with the new image
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePicture = async () => {
        if (!imageToCrop || !auth.currentUser) return;
        setIsUploading(true);

        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
        const userDocRef = doc(db, 'users', auth.currentUser.uid);

        try {
            await uploadString(storageRef, imageToCrop, 'data_url');
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(userDocRef, {
                profilePicUrl: downloadURL
            });
            setProfilePic(downloadURL);
        } catch (error) {
            console.error("Error uploading profile picture: ", error);
            alert("Failed to upload picture. Please try again.");
        } finally {
            setIsUploading(false);
            setIsModalOpen(false);
            setImageToCrop(null);
        }
    };

    const handleRemovePicture = async () => {
        if (!auth.currentUser) return;
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        
        try {
            await updateDoc(userDocRef, {
                profilePicUrl: null
            });
            const initials = `${profileData.fullName?.charAt(0) || ''}${profileData.surname?.charAt(0) || ''}`;
            const fallback = `https://placehold.co/150x150/E8F0FE/3367D6?text=${initials}`;
            setProfilePic(fallback);
        } catch (error) {
            console.error("Error removing profile picture: ", error);
            alert("Failed to remove picture. Please try again.");
        } finally {
            setIsModalOpen(false);
            setImageToCrop(null);
        }
    };

    if (loading || !profileData) {
        return <div className="loading-fullscreen">Loading profile...</div>;
    }

    return (
        <div className="profile-view">
            <div className="profile-header-section">
                <button className="profile-picture-button" onClick={() => setIsModalOpen(true)}>
                    <img src={profilePic} alt="Profile" className="profile-main-avatar" />
                    <div className="edit-overlay"><span className="material-symbols-outlined">photo_camera</span></div>
                </button>
                <div className="profile-header-text">
                    <h1>{profileData.fullName} {profileData.surname}</h1>
                    <p>{profileData.email?.toLowerCase()}</p>
                </div>
            </div>

            <div className="profile-details-section">
                <h2>Personal Information</h2>
                <div className="profile-display">
                    <div className="detail-item"><span className="detail-label">Full Name</span><span className="detail-value">{profileData.fullName}</span></div>
                    <div className="detail-item"><span className="detail-label">Surname</span><span className="detail-value">{profileData.surname}</span></div>
                    <div className="detail-item"><span className="detail-label">Email Address</span><span className="detail-value">{profileData.email?.toLowerCase()}</span></div>
                    <div className="detail-item"><span className="detail-label">Location</span><span className="detail-value">{`${profileData.city}, ${profileData.state}, ${profileData.country}`}</span></div>
                </div>
            </div>

            <div className="profile-details-section">
                <h2>Academic Information</h2>
                <div className="profile-display">
                    {profileData.educationLevel === 'College' && (
                        <>
                            <div className="detail-item"><span className="detail-label">College</span><span className="detail-value">{profileData.collegeName}</span></div>
                            <div className="detail-item"><span className="detail-label">Degree</span><span className="detail-value">{profileData.degree}</span></div>
                            <div className="detail-item"><span className="detail-label">Course</span><span className="detail-value">{profileData.course}</span></div>
                            <div className="detail-item"><span className="detail-label">Year of Passing</span><span className="detail-value">{profileData.passingYear}</span></div>
                        </>
                    )}
                    {profileData.educationLevel === 'School' && (
                        <>
                            <div className="detail-item"><span className="detail-label">School</span><span className="detail-value">{profileData.schoolName}</span></div>
                            <div className="detail-item"><span className="detail-label">Class</span><span className="detail-value">{profileData.class}</span></div>
                            <div className="detail-item"><span className="detail-label">Stream</span><span className="detail-value">{profileData.stream}</span></div>
                        </>
                    )}
                    {!profileData.educationLevel && (
                        <p>No academic details provided. Please complete your profile.</p>
                    )}
                </div>
            </div>

            <ImageCropModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={imageToCrop || profilePic}
                onSave={handleSavePicture}
                onRemove={handleRemovePicture}
                onFileSelect={handleFileChange} 
                isSaving={isUploading}
            />
        </div>
    );
};

export default MyProfileView;
