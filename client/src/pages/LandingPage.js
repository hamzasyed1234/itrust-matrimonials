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
        <span className="heart-icon">❤️</span> iTrust Matrimonials
      </div>

      <div className="content-wrapper">
        {/* Left Side - Text */}
        <div className="left-content">
          <h1 className="main-heading">
            Empowering Change,
            <br />
            <span className="accent-text">One Connection at a Time</span>
          </h1>

          <p className="description">
            Join thousands of Muslims finding their perfect match with meaningful connections. 
            Make every conversation count.
          </p>

          <div className="stats">
            <div className="stat-box">
              <h3>2M+</h3>
              <p>Connections Made</p>
            </div>
            <div className="stat-box">
              <h3>500+</h3>
              <p>Success Stories</p>
            </div>
            <div className="stat-box">
              <h3>100%</h3>
              <p>Halal</p>
            </div>
          </div>
        </div>

        {/* Right Side - Get Started Box */}
        <div className="right-content">
          <div className="get-started-box">
            <h2>Get Started</h2>
            <p className="subtitle">Choose how you'd like to proceed</p>

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
            <h2 className="modal-title">How iTrust Matrimonials Works</h2>
            <div className="modal-body">
              <p>Welcome to our Islamic matrimonial platform designed with your values in mind.</p>
              
              <div className="feature">
                <h3>🎯 Meaningful Connections Only</h3>
                <p>To keep people from browsing endlessly for their naseeb, we've added a unique limit: 
                   you can only talk to 3 people at a time.</p>
              </div>

              <div className="feature">
                <h3>🤲 Focus on Quality</h3>
                <p>This encourages meaningful conversations and serious intentions, ensuring every 
                   match gets the attention it deserves.</p>
              </div>

              <div className="feature">
                <h3>✨ Halal Process</h3>
                <p>Complete your profile, browse potential matches with our filtering system, 
                   and connect with those who share your values.</p>
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