import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import './SignUp.css';

function SignUp({ onClose, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const age = Math.floor((new Date() - new Date(formData.dateOfBirth)) / 31557600000);
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      // Send registration data to backend
      const response = await api.post('/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        email: formData.email,
        password: formData.password
      });

      console.log('Registration successful:', response.data);
      
      // Close the modal
      onClose();
      
      // Redirect to verification page with email
      navigate('/verify-email', { 
        state: { email: formData.email } 
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages from backend
      if (error.response && error.response.data && error.response.data.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <button className="close-btn" onClick={onClose}>✕</button>
      
      <div className="signup-header">
        <h2 className="signup-title">Create Account</h2>
        <p className="signup-subtitle">
          {step === 1 ? 'Tell us about yourself' : 'Secure your account'}
        </p>
        
        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>
      </div>

      {/* Step 1: Personal Information */}
      {step === 1 && (
        <div className="signup-form step-1">
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? 'error' : ''}
              placeholder="Enter your first name"
            />
            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? 'error' : ''}
              placeholder="Enter your last name"
            />
            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
          </div>

          {/* Date of Birth */}
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={errors.dateOfBirth ? 'error' : ''}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
            {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
          </div>

          {/* Gender */}
          <div className="form-group">
            <label>Gender</label>
            <div className="gender-options">
              <label className={`gender-option ${formData.gender === 'male' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                <span>Male</span>
              </label>
              <label className={`gender-option ${formData.gender === 'female' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                <span>Female</span>
              </label>
            </div>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>

          {/* Next Button */}
          <button type="button" className="submit-btn" onClick={handleNext}>
            Next →
          </button>

          {/* Login Link - Now on Step 1 */}
          <p className="login-link">
            Already have an account? <span onClick={onSwitchToLogin}>Log In</span>
          </p>
        </div>
      )}

      {/* Step 2: Account Security */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="signup-form step-2">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="Create a password (min 6 characters)"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="button-group">
            <button type="button" className="back-btn" onClick={handleBack}>
              ← Back
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default SignUp;