import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './HomePage.css';

function HomePage() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCompleteProfile = () => {
    navigate('/complete-profile');
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="home-page">
      {/* Navbar Component */}
      <Navbar onLogout={handleLogout} activeTab="home" />

      {/* Main Content */}
      <div className="home-content">
        <div className="welcome-section">
          <h1>Welcome back, {user.firstName}! 💕</h1>
          <p className="welcome-text">Ready to find your perfect match?</p>
        </div>

        {/* Profile Status */}
        {!user.profileCompleted && (
          <div className="alert-box">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <h3>Complete Your Profile</h3>
              <p>Add more details to help others get to know you better!</p>
            </div>
            <button className="alert-btn" onClick={handleCompleteProfile}>
              Complete Profile →
            </button>
          </div>
        )}

        {/* User Info Card */}
        <div className="profile-card">
          <h2>Your Profile</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{user.firstName} {user.lastName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Gender:</span>
              <span className="info-value">{user.gender}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Profile Status:</span>
              <span className={`info-value ${user.profileCompleted ? 'complete' : 'incomplete'}`}>
                {user.profileCompleted ? '✓ Complete' : '○ Incomplete'}
              </span>
            </div>
          </div>
          {user.profileCompleted && (
            <button className="edit-profile-btn" onClick={handleCompleteProfile}>
              Edit Profile ✏️
            </button>
          )}
        </div>

        {/* Coming Soon Section */}
        <div className="coming-soon">
          <h2>Coming Soon</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">👥</span>
              <h3>Browse Profiles</h3>
              <p>Discover potential matches based on your preferences</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💬</span>
              <h3>Messages</h3>
              <p>Connect with your matches (limit: 3 at a time)</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔍</span>
              <h3>Advanced Filters</h3>
              <p>Filter by location, education, profession, and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;