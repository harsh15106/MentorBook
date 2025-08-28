// src/components/SNavbar.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import './SNavbar.css';

const SNavbar = ({ onProfileClick, userData, onNavClick, profilePic, unreadCount }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home', path: '/student/home' },
    { id: 'search', label: 'Search', icon: 'search', path: '/student/search' },
    { id: 'appointments', label: 'Appointments', icon: 'calendar_month', path: '/student/appointments' },
    { id: 'message', label: 'Messages', icon: 'chat', path: '/student/message' },
  ];

  const userInitials = userData ? `${userData.fullName?.charAt(0)}${userData.surname?.charAt(0)}` : "S";

  return (
    <header className="horizontal-navbar">
      <div className="navbar-logo">
        <h2>Mentor<span>Book</span></h2>
      </div>

      <nav className="navbar-links">
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <NavLink 
                to={item.path} 
                onClick={(e) => {
                  e.preventDefault();
                  onNavClick(item.path);
                }}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="nav-label">
                  {item.label}
                  {item.id === 'message' && unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
                  )}
                </span>
              </NavLink>
            </li>
          ))}
          
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

export default SNavbar;
