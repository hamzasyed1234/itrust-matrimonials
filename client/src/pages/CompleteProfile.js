import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './CompleteProfile.css';

function CompleteProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    profilePicture: '',
    ethnicity: '',
    height: '',
    birthPlace: '',
    currentLocation: '',
    profession: '',
    education: '',
    languages: [],
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  const handleLanguagesChange = (e) => {
    const languages = e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang);
    setFormData(prev => ({
      ...prev,
      languages
    }));
  };

  const handleSkip = () => {
    // Navigate to home page
    navigate('/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/profile/update', formData);
      console.log('Profile updated:', response.data);

      // Navigate to home page
      navigate('/home');
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to update profile. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-container">
        <div className="logo">
          <span className="heart-icon">❤️</span> iTrust Matrimonials
        </div>

        <div className="profile-header">
          <h2 className="profile-title">Complete Your Profile</h2>
          <p className="profile-subtitle">
            Help others get to know you better (You can skip this for now)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Profile Picture URL */}
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture URL</label>
            <input
              type="url"
              id="profilePicture"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              placeholder="Enter image URL"
            />
            <span className="helper-text">For now, paste an image URL (e.g., from Imgur)</span>
          </div>

          {/* Ethnicity */}
          <div className="form-group">
            <label htmlFor="ethnicity">Ethnicity</label>
            <input
              type="text"
              id="ethnicity"
              name="ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
              placeholder="e.g., Arab, South Asian, African"
            />
          </div>

          {/* Height */}
          <div className="form-group">
            <label htmlFor="height">Height</label>
            <input
              type="text"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g., 5'8&quot; or 173cm"
            />
          </div>

          {/* Birth Place */}
          <div className="form-group">
            <label htmlFor="birthPlace">Where were you born?</label>
            <input
              type="text"
              id="birthPlace"
              name="birthPlace"
              value={formData.birthPlace}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>

          {/* Current Location */}
          <div className="form-group">
            <label htmlFor="currentLocation">Where do you live now?</label>
            <input
              type="text"
              id="currentLocation"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>

          {/* Profession */}
          <div className="form-group">
            <label htmlFor="profession">Profession</label>
            <input
              type="text"
              id="profession"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              placeholder="e.g., Software Engineer, Teacher"
            />
          </div>

          {/* Education */}
          <div className="form-group">
            <label htmlFor="education">Education</label>
            <input
              type="text"
              id="education"
              name="education"
              value={formData.education}
              onChange={handleChange}
              placeholder="e.g., Bachelor's in Computer Science"
            />
          </div>

          {/* Languages */}
          <div className="form-group">
            <label htmlFor="languages">Languages (comma separated)</label>
            <input
              type="text"
              id="languages"
              name="languages"
              value={formData.languages.join(', ')}
              onChange={handleLanguagesChange}
              placeholder="e.g., English, Arabic, Urdu"
            />
          </div>

          {/* Bio */}
          <div className="form-group">
            <label htmlFor="bio">About You</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Tell us about yourself, your hobbies, what you like to do in your free time, your goals... 😊"
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="submit-error">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="button-group">
            <button type="button" className="skip-btn" onClick={handleSkip}>
              Skip for Now
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;