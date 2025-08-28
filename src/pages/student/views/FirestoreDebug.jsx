// src/pages/student/views/FirestoreDebug.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase'; // Make sure this path is correct for your project
import { collection, query, where, getDocs } from 'firebase/firestore';
import './FirestoreDebug.css';

const FirestoreDebug = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    // Check if the db object from firebase.js is valid
    if (db) {
      setDbStatus('Firebase DB object is initialized.');
    } else {
      setDbStatus('Firebase DB object is NOT initialized. Check your firebase.js file.');
    }

    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("DEBUG: Attempting to fetch teachers...");
        const teachersCollectionRef = collection(db, 'users');
        const q = query(teachersCollectionRef, where("role", "==", "teacher"));
        
        const querySnapshot = await getDocs(q);
        
        console.log(`DEBUG: Query finished. Found ${querySnapshot.docs.length} documents.`);

        if (querySnapshot.empty) {
            console.log("DEBUG: The query returned no documents. This is the most likely cause of the issue. Check your Firestore data for an exact match on role: 'teacher' and check your security rules.");
        }

        const teachersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTeachers(teachersList);
      } catch (err) {
        console.error("DEBUG: An error occurred during the fetch operation:", err);
        setError(err.message); // Display the actual Firebase error message
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="debug-container">
      <h1>Firestore Connection Test</h1>
      
      <div className="debug-section">
        <h2>1. Firebase Initialization</h2>
        <p className={db ? 'success' : 'error'}>{dbStatus}</p>
      </div>

      <div className="debug-section">
        <h2>2. Fetch Status</h2>
        {loading && <p className="loading">Attempting to fetch data from Firestore...</p>}
        {error && <p className="error"><strong>Error Occurred:</strong> {error}</p>}
        {!loading && !error && <p className="success">Fetch operation completed without errors.</p>}
      </div>

      <div className="debug-section">
        <h2>3. Results</h2>
        <p>The query for teachers returned <strong>{teachers.length}</strong> document(s).</p>
        
        {teachers.length > 0 ? (
          <pre className="raw-data">
            {JSON.stringify(teachers, null, 2)}
          </pre>
        ) : (
          <div className="no-data">
            <h3>Why might the result be 0?</h3>
            <p>If the fetch status above is "successful" but you see 0 results, it means the connection worked, but the query found no matching data. This is almost always caused by one of two things:</p>
            <ul>
              <li><strong>Firestore Security Rules:</strong> Your rules are silently blocking the query. Check the browser console (F12) for a "permission-denied" error.</li>
              <li><strong>Data Mismatch:</strong> There are no documents in your `users` collection that have a field named `role` with the exact lowercase value `teacher`.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirestoreDebug;
