import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './VerifyEmail.css';

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double execution
      if (hasVerified.current) {
        console.log('Already verified, skipping...');
        return;
      }

      if (!token) {
        console.log('No token found in URL');
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      hasVerified.current = true;

      try {
        console.log('Token received from URL:', token);
        console.log('Sending verification request to:', `/auth/verify-email/${token}`);
        const response = await api.get(`/auth/verify-email/${token}`);
        console.log('Verification successful:', response.data);
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        console.error('Error details:', error.response?.data);
        
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="logo">
          <span className="heart-icon">❤️</span> iTrust Matrimonials
        </div>

        {status === 'verifying' && (
          <div className="verify-content">
            <div className="spinner"></div>
            <h2>Verifying Your Email...</h2>
            <p>Please wait while we verify your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-content success">
            <div className="success-icon">✓</div>
            <h2>Email Verified Successfully!</h2>
            <p>{message}</p>
            <p className="redirect-text">Redirecting you to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-content error">
            <div className="error-icon">✕</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <button 
              className="home-btn"
              onClick={() => navigate('/')}
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;