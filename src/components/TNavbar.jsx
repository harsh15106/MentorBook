// src/components/TNavbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import './TNavbar.css';

const TNavbar = ({ onProfileClick, userData, profilePic }) => {
  const navItems = [
    { id: 'home', label: 'Dashboard', icon: 'dashboard', path: '/teacher/home' },
    { id: 'schedule', label: 'My Schedule', icon: 'calendar_month', path: '/teacher/schedule' },
    { id: 'messages', label: 'Messages', icon: 'chat', path: '/teacher/messages' },
  ];

  const userInitials = userData ? `${userData.fullName?.charAt(0)}${userData.surname?.charAt(0)}` : "T";

  return (
    <header className="horizontal-navbar">
      <div className="navbar-logo">
        <h2>Mentor<span>Book</span></h2>
      </div>

      <nav className="navbar-links">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <NavLink to={item.path}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
          
          {/* The profile section is now a list item to work with the mobile layout */}
          <li className="navbar-profile-item" onClick={onProfileClick}>
            <div className="profile-avatar">
                {profilePic ? (
                    <img src={profilePic} alt="Profile" className="navbar-pfp" />
                ) : (
                    userInitials
                )}
            </div>
            <span className="nav-label">Profile</span>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default TNavbar;
