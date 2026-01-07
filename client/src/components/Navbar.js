import React from 'react';
import './Navbar.css';

function Navbar({ onLogout, activeTab = 'home' }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo">
          <span className="navbar-heart-icon">❤️</span>
          <span>iTrust Matrimonials</span>
        </div>
        
        <div className="nav-links">
          <button className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}>
            Home
          </button>
          <button className={`nav-btn ${activeTab === 'browse' ? 'active' : ''}`}>
            Browse
          </button>
          <button className={`nav-btn ${activeTab === 'matches' ? 'active' : ''}`}>
            Matches
          </button>
          <button className="nav-btn logout-btn" onClick={onLogout}>
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;