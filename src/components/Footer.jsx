// src/components/Footer.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css'; // We will create a single CSS file for this

const Footer = () => {
  const location = useLocation();

  // Function to scroll to sections on the landing page
  const scrollToSection = (sectionId) => {
    // Check if we are on the landing page before scrolling
    if (location.pathname === '/') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on the landing page, navigate there first (optional)
      // navigate('/#' + sectionId);
    }
  };

  // Determine which links to show based on the current path
  const renderLinks = () => {
    const pathname = location.pathname;

    if (pathname.startsWith('/student')) {
      return (
        <ul>
          <li><Link to="/student/home">Dashboard</Link></li>
          <li><Link to="/student/profile">My Profile</Link></li>
          <li><a href="#">Help Center</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      );
    }

    if (pathname.startsWith('/teacher')) {
      return (
        <ul>
          <li><Link to="/teacher/home">Dashboard</Link></li>
          <li><Link to="/teacher/schedule">My Schedule</Link></li>
          <li><a href="#">Help Center</a></li>
          <li><a href="#">Terms of Service</a></li>
        </ul>
      );
    }

    // Default to public links for the landing page
    return (
      <ul>
        <li><a href="#about" onClick={() => scrollToSection('about')}>About Us</a></li>
        <li><a href="#faq" onClick={() => scrollToSection('faq')}>FAQ</a></li>
        <li><a href="#feedback" onClick={() => scrollToSection('feedback')}>Contact</a></li>
        <li><a href="#">Privacy Policy</a></li>
      </ul>
    );
  };

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-about">
          <h3>Mentor<span>Book</span></h3>
          <p>Your gateway to personalized mentorship. Connect with the best mentors, anytime, anywhere.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          {renderLinks()}
        </div>
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook" className="social-icon"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Twitter" className="social-icon"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram" className="social-icon"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MentorBook. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
