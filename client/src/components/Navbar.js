import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

function Navbar({ onLogout, activeTab = 'home' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div 
          className="navbar-logo" 
          onClick={() => navigate(user?.isAdmin ? '/admin' : '/home')}
        >
          <span className="navbar-heart-icon">❤️</span>
          <span>iTrust Muslim Matrimonials</span>
        </div>

        <div className="nav-links">
          {/* Show Dashboard for admin, Home for regular users */}
          {user?.isAdmin ? (
            <button
              className={`nav-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
            >
              Dashboard
            </button>
          ) : (
            <button
              className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => navigate('/home')}
            >
              Home
            </button>
          )}

          {/* Only show these for regular users, not admins */}
          {!user?.isAdmin && (
            <>
              <button
                className={`nav-btn ${activeTab === 'browse' ? 'active' : ''}`}
                onClick={() => navigate('/browse')}
              >
                Search
              </button>

              <button
                className={`nav-btn ${activeTab === 'matches' ? 'active' : ''}`}
                onClick={() => navigate('/matches')}
              >
                Matches
              </button>
            </>
          )}

          <button
            className={`nav-btn ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => navigate('/feedback')}
          >
            Feedback
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