// src/components/DashboardFooter.jsx

import React from 'react';
import './DashboardFooter.css';

const DashboardFooter = () => {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer-container">
        <p>&copy; {new Date().getFullYear()} MentorBook. All Rights Reserved.</p>
        <div className="dashboard-footer-links">
          <a href="#">Help Center</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
