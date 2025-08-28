// src/pages/AuthPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import './AuthPage.css';

const AuthPage = ({ user, onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const [fullName, setFullName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            await setDoc(doc(db, 'users', newUser.uid), {
                fullName,
                surname,
                email,
                state,
                country,
                city,
                role,
            });
            
            if (role === 'student') {
                 navigate('/student/home', { state: { showDetailsModal: true } });
            } else {
                 onLoginSuccess(role);
            }

        } catch {(err) => {
            setError(err.message.replace('Firebase: ', ''));
        }}
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await doc(db, 'users', userCredential.user.uid);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                onLoginSuccess(docSnap.data().role);
            } else {
                setError("User data not found.");
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    if (user) {
        return null; 
    }

    return (
        <div className="auth-page-container">
            <div className="auth-form-wrapper">
                <div className="auth-header">
                    <h2>{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h2>
                    <p>{isLoginView ? 'Login to continue your journey.' : 'Join MentorBook today.'}</p>
                </div>

                {isLoginView ? (
                    <form onSubmit={handleLogin} className="auth-form">
                        <input id="email" name="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input id="password" name="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <a href="#" className="forgot-password">Forgot Password?</a>
                        {error && <p className="auth-error">{error}</p>}
                        <button type="submit" className="auth-button">Login</button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="auth-form">
                        <div className="form-row">
                            <input id="fullName" name="fullName" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            <input id="surname" name="surname" type="text" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                        </div>
                        <input id="signup-email" name="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <input id="signup-password" name="password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <div className="form-row">
                            <input id="city" name="city" type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                            <input id="state" name="state" type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} required />
                        </div>
                        <input id="country" name="country" type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required />
                        <select id="role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="student">I am a Student</option>
                            <option value="teacher">I am a Teacher</option>
                        </select>
                        {error && <p className="auth-error">{error}</p>}
                        <button type="submit" className="auth-button">Create Account</button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>
                        {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                        <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }}>
                            {isLoginView ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
