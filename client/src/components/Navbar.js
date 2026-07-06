import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Navbar.css';

function Navbar({ onLogout, activeTab = 'home' }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending connection request count for the Matches badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user || user.isAdmin) return;
      try {
        const response = await api.get('/connections/pending');
        if (response.data.success) {
          setPendingCount(response.data.requests?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching pending count for navbar:', error);
      }
    };

    fetchPendingCount();
  }, [user?._id]);

  // If user is admin, show minimal navbar
  if (user?.isAdmin) {
    return (
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo non-clickable">
            <span className="navbar-heart-icon">❤️</span>
            <span>iTrust Muslim Matrimonials</span>
          </div>

          <div className="nav-links">
            <button className="nav-btn logout-btn" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Regular user navbar
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-logo" onClick={() => navigate('/home')}>
          <span className="navbar-heart-icon">❤️</span>
          <span>iTrust Muslim Matrimonials</span>
        </div>

        <div className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => navigate('/home')}
          >
            Home
          </button>

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
            {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
          </button>

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