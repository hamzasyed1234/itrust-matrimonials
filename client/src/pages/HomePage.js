import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './HomePage.css';

function HomePage() {
  const { user, logout, loading, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAddInfo, setShowAddInfo] = useState(false);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [customFields, setCustomFields] = useState({});
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Refresh user profile data when component mounts
  useEffect(() => {
    const refreshUserProfile = async () => {
      if (user && !refreshing) {
        setRefreshing(true);
        try {
          const response = await api.get('/profile');
          if (response.data.user) {
            updateUser(response.data.user);
            // Load custom fields if they exist
            if (response.data.user.customFields) {
              setCustomFields(response.data.user.customFields);
            }
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
        } finally {
          setRefreshing(false);
        }
      }
    };

    refreshUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if profile is complete (all compulsory fields filled)
  const isProfileComplete = () => {
    if (!user) return false;
    return !!(
      user.email &&
      user.gender &&
      user.dateOfBirth &&
      user.ethnicity && user.ethnicity.trim() !== '' &&
      user.height && user.height.trim() !== '' &&
      user.birthPlace && user.birthPlace.trim() !== '' &&
      user.currentLocation && user.currentLocation.trim() !== '' &&
      user.profession && user.profession.trim() !== '' &&
      user.education && user.education.trim() !== '' &&
      user.languages && user.languages.length > 0 &&
      user.maritalStatus && user.maritalStatus.trim() !== ''
    );
  };

  // Start editing a field
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    if (field === 'languages') {
      setEditValue(Array.isArray(currentValue) ? currentValue.join(', ') : '');
    } else {
      setEditValue(currentValue || '');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
    setCustomFieldName('');
  };

  // Save field changes
  const saveField = async () => {
    if (!editingField) return;

    setSaving(true);
    try {
      const updateData = new FormData();
      
      // Only send the field being edited
      if (editingField === 'languages') {
        const languagesArray = editValue.split(',').map(lang => lang.trim()).filter(lang => lang);
        updateData.append('languages', JSON.stringify(languagesArray));
      } else {
        updateData.append(editingField, editValue);
      }

      const response = await api.put('/profile/update', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
      }

      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating field:', error);
      alert('Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
        setShowImageUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create cropped image
  const createCroppedImage = async () => {
    try {
      const image = new Image();
      image.src = imageToCrop;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate crop dimensions based on the circular overlay (250px)
      const cropSize = 250;
      const imgElement = document.querySelector('.crop-area img');
      if (!imgElement) return null;

      const rect = imgElement.getBoundingClientRect();
      const scaleX = image.naturalWidth / rect.width;
      const scaleY = image.naturalHeight / rect.height;

      // Center crop
      const centerX = (rect.width / 2 - crop.x) * scaleX;
      const centerY = (rect.height / 2 - crop.y) * scaleY;
      const cropSizeScaled = (cropSize / zoom) * scaleX;

      canvas.width = cropSize;
      canvas.height = cropSize;

      ctx.drawImage(
        image,
        centerX - cropSizeScaled / 2,
        centerY - cropSizeScaled / 2,
        cropSizeScaled,
        cropSizeScaled,
        0,
        0,
        cropSize,
        cropSize
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.95);
      });
    } catch (error) {
      console.error('Error cropping image:', error);
      return null;
    }
  };

  // Handle crop save
  const handleCropSave = async () => {
    setSaving(true);
    try {
      const croppedBlob = await createCroppedImage();
      
      if (!croppedBlob) {
        alert('Failed to crop image');
        setSaving(false);
        return;
      }

      // Convert blob to file
      const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(croppedFile);

      setSelectedImage(croppedFile);
      setShowCropModal(false);
      setImageToCrop(null);
      setShowImageUpload(true);
    } catch (error) {
      console.error('Error processing cropped image:', error);
      alert('Failed to process image');
    } finally {
      setSaving(false);
    }
  };

  // Cancel crop
  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Upload profile picture
  const uploadProfilePicture = async () => {
    if (!selectedImage) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedImage);

      const response = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
      }

      setShowImageUpload(false);
      setSelectedImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Add custom field
  const addCustomField = async () => {
    if (!customFieldName.trim() || !customFieldValue.trim()) {
      alert('Please fill in both field name and value');
      return;
    }

    setSaving(true);
    try {
      const updatedCustomFields = {
        ...customFields,
        [customFieldName]: customFieldValue
      };

      const formData = new FormData();
      formData.append('customFields', JSON.stringify(updatedCustomFields));

      const response = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
        setCustomFields(updatedCustomFields);
      }

      setCustomFieldName('');
      setCustomFieldValue('');
      setShowAddInfo(false);
    } catch (error) {
      console.error('Error adding custom field:', error);
      alert('Failed to add information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete custom field
  const deleteCustomField = async (fieldName) => {
    setSaving(true);
    try {
      const updatedCustomFields = { ...customFields };
      delete updatedCustomFields[fieldName];

      const formData = new FormData();
      formData.append('customFields', JSON.stringify(updatedCustomFields));

      const response = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
        setCustomFields(updatedCustomFields);
      }
    } catch (error) {
      console.error('Error deleting custom field:', error);
      alert('Failed to delete information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Edit custom field
  const editCustomField = async (oldFieldName, newFieldName, newValue) => {
    if (!newFieldName.trim() || !newValue.trim()) {
      alert('Please fill in both field name and value');
      return;
    }

    setSaving(true);
    try {
      const updatedCustomFields = { ...customFields };
      delete updatedCustomFields[oldFieldName];
      updatedCustomFields[newFieldName] = newValue;

      const formData = new FormData();
      formData.append('customFields', JSON.stringify(updatedCustomFields));

      const response = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
        setCustomFields(updatedCustomFields);
      }
      
      setEditingField(null);
      setEditValue('');
      setCustomFieldName('');
    } catch (error) {
      console.error('Error editing custom field:', error);
      alert('Failed to update information. Please try again.');
    } finally {
      setSaving(false);
    }
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

  const profileImageUrl = user.profilePicture 
    ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`
    : null;

  const profileComplete = isProfileComplete();

  return (
    <div className="home-page">
      <Navbar onLogout={handleLogout} activeTab="home" />

      <div className="home-content">
        <div className="welcome-section">
          <h1>Welcome back, {user.firstName}! 💕</h1>
          <p className="welcome-text">Ready to find your perfect match?</p>
        </div>

        {/* Two Column Layout */}
        <div className="profile-layout">
          {/* Left Side - Profile Card */}
          <div className="left-column">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-picture-container">
                  {previewImage || profileImageUrl ? (
                    <img src={previewImage || profileImageUrl} alt="Profile" className="profile-picture" />
                  ) : (
                    <div className="profile-picture-placeholder">
                      <span className="placeholder-icon">👤</span>
                    </div>
                  )}
                </div>
                <h2>{user.firstName} {user.lastName}</h2>
                <button 
                  className="edit-profile-btn" 
                  onClick={() => setShowImageUpload(!showImageUpload)}
                >
                  📷 Edit Profile Picture
                </button>

                {/* Image Upload Section */}
                {showImageUpload && (
                  <div className="image-upload-section">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <label htmlFor="imageUpload" className="file-upload-btn">
                      Choose Image
                    </label>
                    {selectedImage && (
                      <button 
                        className="upload-btn" 
                        onClick={uploadProfilePicture}
                        disabled={saving}
                      >
                        {saving ? 'Uploading...' : 'Upload'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-info">
                {/* COMPULSORY FIELDS - Not Editable (Phase 1) */}
                <div className="info-row">
                  <span className="info-label">📧 Email</span>
                  <span className="info-value">{user.email}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">⚧ Gender</span>
                  <span className="info-value">{user.gender}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">🎂 Age</span>
                  <span className="info-value">{calculateAge(user.dateOfBirth)} years</span>
                </div>

                {/* COMPULSORY FIELDS - Editable (Phase 2) */}
                
                {/* Ethnicity - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'ethnicity' ? (
                    <>
                      <span className="info-label">🌍 Ethnicity *</span>
                      <div className="edit-controls">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="e.g., South Asian"
                          autoFocus
                        />
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('ethnicity', user.ethnicity)}>
                        ✏️
                      </button>
                      <span className="info-label">🌍 Ethnicity *</span>
                      <span className="info-value">{user.ethnicity || 'Required'}</span>
                    </>
                  )}
                </div>

                {/* Height - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'height' ? (
                    <>
                      <span className="info-label">📏 Height *</span>
                      <div className="edit-controls">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="e.g., 5'9&quot; or 175cm"
                          autoFocus
                        />
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('height', user.height)}>
                        ✏️
                      </button>
                      <span className="info-label">📏 Height *</span>
                      <span className="info-value">{user.height || 'Required'}</span>
                    </>
                  )}
                </div>

                {/* Marital Status - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'maritalStatus' ? (
                    <>
                      <span className="info-label">💍 Marital Status *</span>
                      <div className="edit-controls">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        >
                          <option value="">Select...</option>
                          <option value="Never Married">Never Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Other">Other</option>
                        </select>
                        {editValue === 'Other' && (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder="Please specify"
                          />
                        )}
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('maritalStatus', user.maritalStatus)}>
                        ✏️
                      </button>
                      <span className="info-label">💍 Marital Status *</span>
                      <span className="info-value">{user.maritalStatus || 'Required'}</span>
                    </>
                  )}
                </div>

                {/* Birth Place - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'birthPlace' ? (
                    <>
                      <span className="info-label">🏠 Birth Place *</span>
                      <div className="edit-controls">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="City, Country"
                          autoFocus
                        />
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('birthPlace', user.birthPlace)}>
                        ✏️
                      </button>
                      <span className="info-label">🏠 Birth Place *</span>
                      <span className="info-value">{user.birthPlace || 'Required'}</span>
                    </>
                  )}
                </div>

                {/* Current Location - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'currentLocation' ? (
                    <>
                      <span className="info-label">📍 Location *</span>
                      <div className="edit-controls">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="City, Country"
                          autoFocus
                        />
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('currentLocation', user.currentLocation)}>
                        ✏️
                      </button>
                      <span className="info-label">📍 Location *</span>
                      <span className="info-value">{user.currentLocation || 'Required'}</span>
                    </>
                  )}
                </div>

                {/* Profession - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'profession' ? (
                    <>
                      <span className="info-label">💼 Profession *</span>
                      <div className="edit-controls">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="e.g., Software Engineer"
                          autoFocus
                        />
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('profession', user.profession)}>
                        ✏️
                      </button>
                      <span className="info-label">💼 Profession *</span>
                      <span className="info-value">{user.profession || 'Required'}</span>
                    </>
                  )}
                </div>

                {/* Education - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'education' ? (
                    <>
                      <span className="info-label">🎓 Education *</span>
                      <div className="edit-controls">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="e.g., Bachelor's Degree"
                          autoFocus
                        />
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('education', user.education)}>
                        ✏️
                      </button>
                      <span className="info-label">🎓 Education *</span>
                      <span className="info-value">{user.education || 'Required'}</span>
                    </>
                  )}
                </div>

                {/* Languages - COMPULSORY */}
                <div className="info-row editable">
                  {editingField === 'languages' ? (
                    <>
                      <span className="info-label">🗣️ Languages *</span>
                      <div className="edit-controls">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="e.g., English, Arabic, Urdu"
                          autoFocus
                        />
                        <button className="save-btn" onClick={saveField} disabled={saving}>
                          {saving ? '...' : '✓'}
                        </button>
                        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="edit-icon" onClick={() => startEditing('languages', user.languages)}>
                        ✏️
                      </button>
                      <span className="info-label">🗣️ Languages *</span>
                      <span className="info-value">
                        {user.languages && user.languages.length > 0 ? user.languages.join(', ') : 'Required'}
                      </span>
                    </>
                  )}
                </div>




{/* Phone Number - REQUIRED */}
<div className="info-row editable">
  {editingField === 'phoneNumber' ? (
    <>
      <span className="info-label">📱 Phone Number *</span>
      <div className="edit-controls">
        <input
          type="tel"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="+1 (234) 567-8900"
          autoFocus
          style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}
        />
        <button className="save-btn" onClick={saveField} disabled={saving}>
          {saving ? '...' : '✓'}
        </button>
        <button className="cancel-btn" onClick={cancelEditing}>✕</button>
      </div>
    </>
  ) : (
    <>
      <button className="edit-icon" onClick={() => startEditing('phoneNumber', user.phoneNumber)}>
        ✏️
      </button>
      <span className="info-label">📱 Phone Number *</span>
      <span className="info-value">
        {user.phoneNumber || 'Required'}
      </span>
    </>
  )}
</div>
<p className="privacy-hint">Your phone number will only be visible to people you match with</p>



                {/* Custom Fields - OPTIONAL */}
                {Object.keys(customFields).length > 0 && (
                  <div className="custom-fields-section">
                    <h3 className="section-title">Additional Information</h3>
                    {Object.entries(customFields).map(([key, value]) => (
                      <div key={key} className="info-row custom-field">
                        {editingField === `custom_${key}` ? (
                          <>
                            <span className="info-label">✨</span>
                            <div className="edit-controls">
                              <input
                                type="text"
                                value={customFieldName}
                                onChange={(e) => setCustomFieldName(e.target.value)}
                                placeholder="Field name"
                                autoFocus
                              />
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="Value"
                              />
                              <button
                                className="save-btn"
                                onClick={() => editCustomField(key, customFieldName, editValue)}
                                disabled={saving}
                              >
                                {saving ? '...' : '✓'}
                              </button>
                              <button className="cancel-btn" onClick={cancelEditing}>✕</button>
                            </div>
                          </>
                        ) : (
                          <>
                            <button
                              className="edit-icon"
                              onClick={() => {
                                setEditingField(`custom_${key}`);
                                setCustomFieldName(key);
                                setEditValue(value);
                              }}
                            >
                              ✏️
                            </button>
                            <span className="info-label">✨ {key}</span>
                            <span className="info-value">{value}</span>
                            <button
                              className="delete-custom-btn"
                              onClick={() => deleteCustomField(key)}
                              disabled={saving}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Information Button */}
                <button className="add-info-btn" onClick={() => setShowAddInfo(true)}>
                  ➕ Add Information
                </button>

                {/* Profile Completion Status */}
                <div className={`completion-status ${profileComplete ? 'complete' : 'incomplete'}`}>
                  <div className="status-icon">{profileComplete ? '✅' : '⚠️'}</div>
                  <div className="status-text">
                    <strong>{profileComplete ? 'Profile Complete!' : 'Profile Incomplete'}</strong>
                    <p>{profileComplete ? 'You can now browse profiles' : 'Fill all required (*) fields to complete'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Matches & Stats */}
          <div className="right-column">
            {/* Matches Notification Card */}
            <div className="matches-card">
              <div className="card-header">
                <h3>💕 Matches</h3>
                <span className="match-count">{user.matchCount || 0}/3</span>
              </div>
              <div className="matches-content">
                {(user.matchCount || 0) === 0 ? (
                  <div className="no-matches">
                    <span className="empty-icon">💔</span>
                    <p>No matches yet</p>
                    <p className="hint">
                      {profileComplete 
                        ? 'Start browsing to find your perfect match!' 
                        : 'Complete your profile to start browsing!'}
                    </p>
                  </div>
                ) : (
                  <div className="matches-list">
                    <p className="coming-soon-text">Match details coming soon...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="stats-card">
              <div className="card-header">
                <h3>📊 Your Statistics</h3>
              </div>
              <div className="stats-content">
                <div className="stat-item">
                  <div className="stat-icon">👁️</div>
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Profile Views</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">💝</div>
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">People Interested</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">✨</div>
                  <div className="stat-info">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Connections Made</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">💬</div>
                  <div className="stat-info">
                    <span className="stat-value">{user.matchCount || 0}</span>
                    <span className="stat-label">Active Conversations</span>
                  </div>
                </div>
              </div>
              <p className="stats-note">Statistics will update as you use the platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className="modal-overlay" onClick={handleCropCancel}>
          <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCropCancel}>✕</button>
            <h3>Crop Your Photo</h3>
            <p className="modal-subtitle">Drag to reposition, scroll to zoom</p>
            
            <div className="crop-container">
              <div className="crop-area">
                <img 
                  src={imageToCrop} 
                  alt="Crop preview"
                  style={{
                    transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                    transformOrigin: 'center',
                    cursor: 'move',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  draggable={false}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX - crop.x;
                    const startY = e.clientY - crop.y;
                    
                    const handleMouseMove = (moveEvent) => {
                      setCrop({
                        x: moveEvent.clientX - startX,
                        y: moveEvent.clientY - startY
                      });
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const startX = touch.clientX - crop.x;
                    const startY = touch.clientY - crop.y;
                    
                    const handleTouchMove = (moveEvent) => {
                      const moveTouch = moveEvent.touches[0];
                      setCrop({
                        x: moveTouch.clientX - startX,
                        y: moveTouch.clientY - startY
                      });
                    };
                    
                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                />
                <div className="crop-circle-overlay"></div>
              </div>
              
              <div className="zoom-control">
                <span>🔍-</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="zoom-slider"
                />
                <span>🔍+</span>
              </div>
            </div>

            <div className="modal-buttons">
              <button 
                className="modal-save-btn" 
                onClick={handleCropSave}
                disabled={saving}
              >
                {saving ? 'Processing...' : 'Apply Crop'}
              </button>
              <button className="modal-cancel-btn" onClick={handleCropCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Information Modal */}
      {showAddInfo && (
        <div className="modal-overlay" onClick={() => setShowAddInfo(false)}>
          <div className="add-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddInfo(false)}>✕</button>
            <h3>Add Custom Information</h3>
            <p className="modal-subtitle">Add additional details to your profile (e.g., Complexion, Hobbies, etc.)</p>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Field Name</label>
                <input
                  type="text"
                  value={customFieldName}
                  onChange={(e) => setCustomFieldName(e.target.value)}
                  placeholder="e.g., Complexion, Hobbies, Interests"
                />
              </div>
              
              <div className="form-group">
                <label>Information</label>
                <input
                  type="text"
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                  placeholder="e.g., Fair skin, Reading books, Traveling"
                />
              </div>

              <div className="modal-buttons">
                <button 
                  className="modal-save-btn" 
                  onClick={addCustomField}
                  disabled={saving || !customFieldName.trim() || !customFieldValue.trim()}
                >
                  {saving ? 'Adding...' : 'Add Information'}
                </button>
                <button className="modal-cancel-btn" onClick={() => setShowAddInfo(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;