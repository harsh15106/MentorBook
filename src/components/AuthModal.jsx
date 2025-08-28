// src/components/AuthModal.jsx

import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import './AuthModal.css';

// The component now receives an onLoginSuccess prop from App.jsx
const AuthModal = ({ onClose, onLoginSuccess }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    // Form state
    const [fullName, setFullName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;
            await setDoc(doc(db, 'users', newUser.uid), {
                fullName, surname, email, state, country, city, role,
            });
            // The onAuthStateChanged listener in App.jsx will handle the redirect.
            onClose();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener in App.jsx will handle the redirect.
            onClose();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                
                <div className="auth-branding-panel">
                    <div className="branding-content">
                        <h2>Mentor<span>Book</span></h2>
                        <p>Unlock your potential. Your mentorship journey starts here.</p>
                    </div>
                </div>

                <div className="auth-form-panel">
                    <div className="auth-header">
                        <h2>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
                    </div>

                    {isLoginView ? (
                        <form onSubmit={handleLogin} className="auth-form">
                            <input id="email" name="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required />
                            <div className="password-wrapper">
                               <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                               <span className="password-toggle-icon material-symbols-outlined" onClick={togglePasswordVisibility}>
                                    {showPassword ? 'visibility_off' : 'visibility'}
                               </span>
                            </div>
                            <div className="form-options">
                                <a href="#" className="forgot-password">Forgot Password?</a>
                            </div>
                            {error && <p className="auth-error">{error}</p>}
                            <button type="submit" className="auth-button">Login</button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup} className="auth-form">
                            <div className="form-row">
                                <input id="fullName" name="fullName" type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                <input id="surname" name="surname" type="text" placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                            </div>
                            <input id="signup-email" name="email" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required />
                            <div className="password-wrapper">
                               <input id="signup-password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                               <span className="password-toggle-icon material-symbols-outlined" onClick={togglePasswordVisibility}>
                                    {showPassword ? 'visibility_off' : 'visibility'}
                               </span>
                            </div>
                            <div className="password-wrapper">
                               <input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                               <span className="password-toggle-icon material-symbols-outlined" onClick={togglePasswordVisibility}>
                                    {showPassword ? 'visibility_off' : 'visibility'}
                               </span>
                            </div>
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
                            <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setPassword(''); setConfirmPassword(''); }}>
                                {isLoginView ? 'Sign Up' : 'Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
