// src/pages/student/views/SearchTeacherView.jsx

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase'; // Make sure auth is exported from your firebase config
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import './SearchTeacherView.css';

// --- EDIT: The component now accepts the student's userData ---
const SearchTeacherView = ({ onViewProfile, userData }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // --- EDIT: Fetch teachers based on the student's location ---
  useEffect(() => {
    // Don't fetch until we have the student's data
    if (!userData) {
        setLoading(false);
        return;
    }

    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const teachersCollectionRef = collection(db, 'users');
        
        // --- This is the new query that filters by location ---
        // It finds users who are teachers AND match the student's city, state, and country.
        const q = query(
            teachersCollectionRef, 
            where("role", "==", "teacher"),
            where("city", "==", userData.city),
            where("state", "==", userData.state),
            where("country", "==", userData.country)
        );
        
        const querySnapshot = await getDocs(q);
        const teachersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTeachers(teachersList);
        setError(null);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        // --- IMPORTANT ---
        // If you see a "FAILED_PRECONDITION" error in the console, it means you need to create a Firestore index.
        // The error message will provide a direct link to create it in the Firebase console. This is a required one-time setup for this type of query.
        setError("Failed to load teachers. An index might be required in Firestore.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [userData]); // Rerun the effect if the student's data changes

  const filters = ['All', 'Maths', 'Physics', 'English', 'Chemistry', 'Biology'];

  // This client-side filtering logic remains the same
  const filteredTeachers = teachers.filter(teacher => {
    const nameMatch = (teacher.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (teacher.surname?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const subjectMatch = teacher.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const filterMatch = activeFilter === 'All' || teacher.subjects?.includes(activeFilter);

    return (nameMatch || subjectMatch) && filterMatch;
  });

  return (
    <div className="dashboard-view">
      <h1>Find Your Mentor</h1>
      <p>Showing mentors available in <strong>{userData ? `${userData.city}, ${userData.state}` : 'your area'}</strong>.</p>
      
      <div className="search-container">
        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Search by name or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-bar">
          {filters.map(filter => (
            <button 
              key={filter} 
              className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading-indicator">Loading teachers...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <div className="teacher-grid">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map(teacher => (
              <div key={teacher.id} className="teacher-card">
                <img 
                  src={`https://placehold.co/100x100/E8F0FE/3367D6?text=${teacher.fullName?.charAt(0) || 'N'}${teacher.surname?.charAt(0) || 'A'}`} 
                  alt={`${teacher.fullName || ''} ${teacher.surname || ''}`} 
                  className="teacher-avatar" 
                />
                <h3 className="teacher-name">{teacher.fullName || 'Unnamed'} {teacher.surname || 'Teacher'}</h3>
                <p className="teacher-subject">{teacher.subjects?.join(', ') || 'N/A'}</p>
                <div className="teacher-rating">
                  <span className="material-symbols-outlined">star</span>
                  <span>4.8</span> 
                </div>
                <button className="view-profile-button" onClick={() => onViewProfile(teacher)}>
                  View Profile
                </button>
              </div>
            ))
          ) : (
            <p className="no-results-message">No teachers found in your location matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchTeacherView;
