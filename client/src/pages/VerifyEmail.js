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
  const [messageType, setMessageType] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [showSpamHelp, setShowSpamHelp] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/signup');
    }
  }, [location, navigate]);

  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
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

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

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

          {/* Spam Folder Help Box */}
          <div className="spam-help-box">
            <div className="spam-help-header">
              <span className="email-icon">📧</span>
              <strong>Can't find the email?</strong>
            </div>
            <div className="spam-help-content">
              <p>Check your <strong>Spam/Junk</strong> folder</p>
              <button 
                className="spam-instructions-toggle"
                onClick={() => setShowSpamHelp(!showSpamHelp)}
              >
                {showSpamHelp ? '▲ Hide Instructions' : '▼ Show Instructions'}
              </button>
              
              {showSpamHelp && (
                <div className="spam-instructions">
                  <h4>If you find it in Spam:</h4>
                  <ol>
                    <li>Open the email from <strong>iTrust Matrimonials</strong></li>
                    <li>Click <strong>"Not Spam"</strong> or <strong>"Report Not Spam"</strong></li>
                    <li>Add <strong>hamzasy416@gmail.com</strong> to your contacts</li>
                    <li>Future emails will arrive in your inbox ✓</li>
                  </ol>
                  <p className="spam-tip">
                    💡 <strong>Tip:</strong> Adding us to contacts ensures you never miss important updates!
                  </p>
                </div>
              )}
            </div>
          </div>

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
            <p>Still didn't receive the code?</p>
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