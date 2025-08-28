// src/components/PublicNavbar.jsx

import React, { useState } from 'react';
import './PublicNavbar.css';

// It now receives onLoginClick from its parent (LandingPage)
const PublicNavbar = ({ onLoginClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
    };

    return (
        <header className="public-navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <a href="/">Mentor<span>Book</span></a>
                </div>

                <nav className={`navbarlinks ${isMenuOpen ? 'open' : ''}`}>
                    <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>Home</a>
                    <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
                    <a href="#faq" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a>
                    <a href="#feedback" onClick={(e) => { e.preventDefault(); scrollToSection('feedback'); }}>Review</a>
                </nav>

                <div className="navbar-actions">
                    {/* This button now calls the function passed from App.jsx */}
                    <button className="login-button" onClick={onLoginClick}>
                        Login
                    </button>
                    <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <span className="material-symbols-outlined">
                            {isMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default PublicNavbar;
