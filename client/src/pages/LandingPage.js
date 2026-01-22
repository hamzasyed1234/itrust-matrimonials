import React, { useState } from 'react';
import SignUp from './SignUp';
import Login from './Login';
import './LandingPage.css';

function LandingPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleSwitchToSignUp = () => {
    setShowLogin(false);
    setShowSignUp(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignUp(false);
    setShowLogin(true);
  };

  return (
    <div className="landing-page">
      {/* Floating Hearts Animation */}
      <div className="hearts-container">
        <span className="heart">💕</span>
        <span className="heart">❤️</span>
        <span className="heart">💖</span>
        <span className="heart">💗</span>
        <span className="heart">💝</span>
      </div>

      {/* Logo - Changed class name to landing-logo */}
      <div className="landing-logo">
        <span className="heart-icon">❤️</span> iTrust Muslim Matrimonials
      </div>

      <div className="content-wrapper">
        {/* Left Side - Text */}
        <div className="left-content">
          <h1 className="main-heading">
            A Stronger Ummah,
            <br />
            <span className="accent-text">One Connection at a Time</span>
          </h1>

          <p className="description">
            Join thousands of Muslims finding their perfect match with meaningful connections. 
            Make every conversation count.
          </p>

          <div className="stats">
            <div className="stat-box">
              <h3>Meaningful</h3>
              <h3>Connections</h3>
              
            </div>
            <div className="stat-box">
              <h3>Focus on</h3>
              <h3>Quality</h3>
              
            </div>
            <div className="stat-box">
              <h3>Halal</h3>
              <h3>Process</h3>
            </div>
          </div>
        </div>

        {/* Right Side - Get Started Box */}
        <div className="right-content">
          <div className="get-started-box">
            <h2>Get Started</h2>
            <p className="subtitle"></p>

            <button 
              className="btn btn-primary"
              onClick={() => setShowSignUp(true)}
            >
              Sign Up →
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => setShowLogin(true)}
            >
              Log In →
            </button>

            <div className="divider">or</div>

            <button 
              className="btn btn-info"
              onClick={() => setShowHowItWorks(true)}
            >
              How it Works →
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowHowItWorks(false)}>✕</button>
            <h2 className="modal-title">Our Values</h2>
            <div className="modal-body">
              <p></p>
              
              <div className="feature">
                <h3>🎯 Complete Your Profile</h3>
                <p>Upon signing up, you will be required to complete your profile before viewing other users.</p>
              </div>

              <div className="feature">
                <h3>🔍 Meeting Your Match</h3>
                <p>With the help of filters and tags, finding your match has never been easier. Once you find the right person, send a connection request.</p>
              </div>

              <div className="feature">
                <h3>💬 Get to Know Them</h3>
                <p>After your request is accepted, connect with your match instantly via WhatsApp with a single click from the Matches page.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="modal-overlay" onClick={() => setShowSignUp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <SignUp 
              onClose={() => setShowSignUp(false)} 
              onSwitchToLogin={handleSwitchToLogin}
            />
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Login 
              onClose={() => setShowLogin(false)}
              onSwitchToSignUp={handleSwitchToSignUp}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;