import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Feedback.css';

function Feedback() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Add your logout logic here
    navigate('/');
  };

  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    phone: '',
    concern: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.phone || !feedbackForm.concern) {
      setSubmitMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Replace 'your-email@example.com' with your actual email
      const response = await fetch('https://formsubmit.co/ajax/info@itrustmuslimmatrimonials.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: feedbackForm.name,
          email: feedbackForm.email,
          phone: feedbackForm.phone,
          message: feedbackForm.concern,
          _subject: 'New Feedback from iTrust Matrimonials'
        })
      });

      if (response.ok) {
        setSubmitMessage('success');
        setFeedbackForm({ name: '', email: '', phone: '', concern: '' });
      } else {
        setSubmitMessage('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar onLogout={handleLogout} activeTab="feedback" />
      <div className="feedback-page">
      <div className="feedback-container">
        <div className="feedback-header">
          <div className="feedback-icon">💬</div>
          <h1>We'd Love to Hear From You</h1>
          <p>Your feedback helps us create a better experience for everyone</p>
        </div>

        <div className="feedback-content">
          <div className="feedback-form-wrapper">
            <div className="feedback-form-card">
              <h2>Send Us Your Feedback</h2>
              <p className="form-subtitle">Please fill out the form below and we'll get back to you as soon as possible.</p>

              <div className="feedback-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={feedbackForm.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (123) 456-7890"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="concern">Your Feedback or Concern *</label>
                  <textarea
                    id="concern"
                    name="concern"
                    value={feedbackForm.concern}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Please share your feedback, suggestions, questions, or concerns. We're here to help!"
                    disabled={isSubmitting}
                  />
                </div>

                {submitMessage && (
                  <div className={`submit-message ${submitMessage === 'success' ? 'success' : 'error'}`}>
                    {submitMessage === 'success' 
                      ? '✓ Thank you! Your feedback has been submitted successfully. We\'ll be in touch soon.'
                      : submitMessage
                    }
                  </div>
                )}

                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Feedback;