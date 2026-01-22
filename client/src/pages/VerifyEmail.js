import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import './VerifyEmail.css';

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Get email from location state (passed from signup)
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email in state, redirect to signup
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleCodeChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      // Focus last input
      document.getElementById('code-5').focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      setMessage('Please enter all 6 digits');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/verify-email', {
        email: email,
        code: verificationCode
      });

      console.log('Verification successful:', response.data);
      
      setMessage('Email verified successfully!');
      setMessageType('success');

      // Store token if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Redirect to home/dashboard after 2 seconds
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (error) {
      console.error('Verification error:', error);
      setMessage(
        error.response?.data?.message || 
        'Verification failed. Please check your code and try again.'
      );
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setMessage('');

    try {
      await api.post('/auth/resend-code', { email });
      setMessage('New verification code sent to your email!');
      setMessageType('success');
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0').focus();
    } catch (error) {
      console.error('Resend error:', error);
      setMessage(
        error.response?.data?.message || 
        'Failed to resend code. Please try again.'
      );
      setMessageType('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        <div className="logo">
          <span className="heart-icon">❤️</span> iTrust Muslim Matrimonials
        </div>

        <div className="verify-content">
          <h2>Verify Your Email</h2>
          <p className="subtitle">
            We've sent a 6-digit verification code to<br />
            <strong>{email}</strong>
          </p>

          <form onSubmit={handleSubmit} className="verification-form">
            <div className="code-inputs" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="code-input"
                  autoFocus={index === 0}
                  disabled={isLoading}
                />
              ))}
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                {messageType === 'success' ? '✓' : '✕'} {message}
              </div>
            )}

            <button 
              type="submit" 
              className="verify-btn"
              disabled={isLoading || code.join('').length !== 6}
            >
              {isLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <p className="spam-notice">📧 Check your spam/junk folder</p>
            <button 
              onClick={handleResendCode}
              className="resend-btn"
              disabled={isResending}
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>

          <button 
            className="back-btn"
            onClick={() => navigate('/signup')}
          >
            ← Back to Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;