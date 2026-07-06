import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './HomePage.css';

// Ethnicity options
const ethnicityOptions = [
  { value: 'African', label: 'African' },
  { value: 'European', label: 'European' },
  { value: 'East Asian', label: 'East Asian' },
  { value: 'South Asian', label: 'South Asian' },
  { value: 'Southeast Asian', label: 'Southeast Asian' },
  { value: 'Central Asian', label: 'Central Asian' },
  { value: 'Middle Eastern', label: 'Middle Eastern' },
  { value: 'Indigenous peoples of America', label: 'Indigenous peoples of America' },
  { value: 'Indigenous peoples of Oceania', label: 'Indigenous peoples of Oceania' }
];

// Height options - Feet (4' to 7')
const feetOptions = [
  { value: 4, label: "4'" },
  { value: 5, label: "5'" },
  { value: 6, label: "6'" },
  { value: 7, label: "7'" }
];

// Residency Status options
const residencyStatusOptions = [
  { value: 'Citizen', label: 'Citizen' },
  { value: 'Permanent Resident (PR)', label: 'Permanent Resident (PR)' },
  { value: 'Student Visa', label: 'Student Visa' },
  { value: 'Work Permit', label: 'Work Permit' },
  { value: 'Visitor / Tourist', label: 'Visitor / Tourist' },
  { value: 'Other', label: 'Other' }
];

// Height options - Inches (0" to 11")
const inchesOptions = Array.from({ length: 12 }, (_, i) => ({
  value: i,
  label: `${i}"`
}));

// Education options
const educationOptions = [
  { value: 'High School Diploma', label: 'High School Diploma' },
  { value: 'College Diploma', label: 'College Diploma' },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: 'Doctorate', label: 'Doctorate' },
  { value: 'Other / Prefer Not to Say', label: 'Other / Prefer Not to Say' }
];

// Profession options (common ones)
const professionOptions = [
  { value: 'Software Engineer', label: 'Software Engineer' },
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Teacher', label: 'Teacher' },
  { value: 'Nurse', label: 'Nurse' },
  { value: 'Accountant', label: 'Accountant' },
  { value: 'Lawyer', label: 'Lawyer' },
  { value: 'Engineer', label: 'Engineer' },
  { value: 'Architect', label: 'Architect' },
  { value: 'Business Analyst', label: 'Business Analyst' },
  { value: 'Marketing Manager', label: 'Marketing Manager' },
  { value: 'Data Scientist', label: 'Data Scientist' },
  { value: 'Pharmacist', label: 'Pharmacist' },
  { value: 'Civil Servant', label: 'Civil Servant' },
  { value: 'Entrepreneur', label: 'Entrepreneur' },
  { value: 'Artist', label: 'Artist' },
  { value: 'Chef', label: 'Chef' },
  { value: 'Student', label: 'Student' },
  { value: 'Self-Employed', label: 'Self-Employed' },
  { value: 'Unemployed', label: 'Unemployed' },
  { value: 'Retired', label: 'Retired' },
  { value: 'Other', label: 'Other' }
];

// Languages (major world languages)
const languageOptions = [
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Czech', label: 'Czech' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'English', label: 'English' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Javanese', label: 'Javanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Persian', label: 'Persian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Swahili', label: 'Swahili' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Tagalog', label: 'Tagalog' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Vietnamese', label: 'Vietnamese' }
];

function HomePage() {
  // ALL STATE DECLARATIONS FIRST
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const { user, logout, loading, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddInfo, setShowAddInfo] = useState(false);
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFields, setCustomFields] = useState({});

  // For location autocomplete
  const debounceTimer = useRef(null);
  const [birthPlaceOptions, setBirthPlaceOptions] = useState([]);
  const [currentLocationOptions, setCurrentLocationOptions] = useState([]);
  const [selectedBirthPlace, setSelectedBirthPlace] = useState(null);
  const [selectedCurrentLocation, setSelectedCurrentLocation] = useState(null);
  const [loadingBirthPlace, setLoadingBirthPlace] = useState(false);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);

  // For height (feet + inches)
  const [heightFeet, setHeightFeet] = useState(null);
  const [heightInches, setHeightInches] = useState(null);

  // For multi-select languages
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // For tags
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

    // For delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteStage, setDeleteStage] = useState('confirm'); // 'confirm', 'deleting', 'complete'
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !saving) {
      e.preventDefault();
      saveField();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }
}, [error]);

 

  // Refresh user profile data when component mounts
  useEffect(() => {
    const refreshUserProfile = async () => {
      if (user && !refreshing) {
        setRefreshing(true);
        try {
          const response = await api.get('/profile');
          if (response.data.user) {
            updateUser(response.data.user);
            if (response.data.user.customFields) {
              setCustomFields(response.data.user.customFields);
            }
            if (response.data.user.tags) {
              setTags(response.data.user.tags);
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

  // Fetch live match data (accepted connections + pending requests).
  // These come straight from the same endpoints MatchesPage uses, so the
  // Home page, Navbar badge, and Matches page can never drift out of sync.
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!user) return;
      setLoadingMatches(true);
      try {
        const [matchesRes, pendingRes] = await Promise.all([
          api.get('/connections/my-connections'),
          api.get('/connections/pending')
        ]);

        if (matchesRes.data.success) {
          setMatches(matchesRes.data.connections || []);
        }
        if (pendingRes.data.success) {
          setPendingCount(pendingRes.data.requests?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching match data:', error);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  // ✅ NEW: Fast database search (replaces Nominatim)
const fetchLocationSuggestionsEnhanced = async (query, setOptions, setLoading) => {
  if (query.length < 2) {
    setOptions([]);
    return;
  }

  setLoading(true);
  try {
    const response = await api.get(`/profile/search-cities?query=${encodeURIComponent(query)}`);
    setOptions(response.data.cities || []);
  } catch (error) {
    console.error('Error fetching cities:', error);
    setOptions([]);
  } finally {
    setLoading(false);
  }
};

// ✅ UPDATED: Faster debounce (150ms instead of 500ms)
const handleLocationInputChange = (inputValue, field) => {
  const setOptions = field === 'birthPlace' ? setBirthPlaceOptions : setCurrentLocationOptions;
  const setLoading = field === 'birthPlace' ? setLoadingBirthPlace : setLoadingCurrentLocation;
  
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);
  }
  
  // Show loading immediately for better UX
  if (inputValue.length >= 2) {
    setLoading(true);
  } else {
    setOptions([]);
    setLoading(false);
    return;
  }
  
  // Faster debounce - 150ms instead of 500ms for snappier response
  debounceTimer.current = setTimeout(() => {
    fetchLocationSuggestionsEnhanced(inputValue, setOptions, setLoading);
  }, 150);
};

  // Loading message component
  const LoadingMessage = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '10px',
      color: '#E66386'
    }}>
      <div style={{
        width: '16px',
        height: '16px',
        border: '2px solid #FFE0E9',
        borderTop: '2px solid #E66386',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite'
      }} />
      <span style={{ fontSize: '14px' }}>Searching locations...</span>
    </div>
  );

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    
    if (field === 'languages') {
      const langValues = Array.isArray(currentValue) 
        ? currentValue.map(lang => ({ value: lang, label: lang }))
        : [];
      setSelectedLanguages(langValues);
    } else if (field === 'height') {
      const match = currentValue?.match(/(\d+)'(\d+)"/);
      if (match) {
        setHeightFeet({ value: parseInt(match[1]), label: `${match[1]}'` });
        setHeightInches({ value: parseInt(match[2]), label: `${match[2]}"` });
      } else {
        setHeightFeet(null);
        setHeightInches(null);
      }
    } else if (field === 'birthPlace') {
      setSelectedBirthPlace(currentValue ? { value: currentValue, label: currentValue } : null);
      setBirthPlaceOptions([]);
    } else if (field === 'currentLocation') {
      setSelectedCurrentLocation(currentValue ? { value: currentValue, label: currentValue } : null);
      setCurrentLocationOptions([]);
    } else {
      setEditValue(currentValue || '');
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
    setCustomFieldName('');
    setHeightFeet(null);
    setHeightInches(null);
    setSelectedLanguages([]);
    setSelectedBirthPlace(null);
    setSelectedCurrentLocation(null);
    setBirthPlaceOptions([]);
    setCurrentLocationOptions([]);
  };

  const saveField = async () => {
    if (!editingField) return;

    setSaving(true);
    try {
      const updateData = new FormData();
      
      if (editingField === 'languages') {
        const languagesArray = selectedLanguages.map(lang => lang.value);
        updateData.append('languages', JSON.stringify(languagesArray));
      } else if (editingField === 'height') {
        if (heightFeet && heightInches !== null) {
          const heightString = `${heightFeet.value}'${heightInches.value}"`;
          updateData.append('height', heightString);
        } else {
          setError({ type: 'error', message: 'Please select both feet and inches' });
          setSaving(false);
          return;
        }
      } else if (editingField === 'birthPlace') {
        if (selectedBirthPlace) {
          updateData.append('birthPlace', selectedBirthPlace.value);
        } else {
          setError({ type: 'error', message: 'Please select a birth place' });
          setSaving(false);
          return;
        }
      } else if (editingField === 'currentLocation') {
        if (selectedCurrentLocation) {
          updateData.append('currentLocation', selectedCurrentLocation.value);
        } else {
          setError({ type: 'error', message: 'Please select a current location' });
          setSaving(false);
          return;
        }
      } else {
        updateData.append(editingField, editValue);
      }

      const response = await api.put('/profile/update', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
      }

      cancelEditing();
    } catch (error) {
      console.error('Error updating field:', error);
      setError({ type: 'error', message: 'Failed to update. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

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
      setError({ type: 'error', message: 'Failed to delete information. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const editCustomField = async (oldFieldName, newFieldName, newValue) => {
    if (!newFieldName.trim() || !newValue.trim()) {
      setError({ type: 'error', message: 'Please fill in both field name and value' });
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
      
      cancelEditing();
    } catch (error) {
      console.error('Error editing custom field:', error);
      setError({ type: 'error', message: 'Failed to update information. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Tag functions
  const addTag = async () => {
    if (!newTag.trim() || newTag.length > 20) {
      setError({ type: 'error', message: 'Tag must be between 1 and 20 characters' });
      return;
    }

    if (tags.length >= 10) {
      setError({ type: 'error', message: 'You can only add up to 10 tags' });
      return;
    }

    if (tags.includes(newTag.trim())) {
      setError({ type: 'error', message: 'This tag already exists' });
      return;
    }

    setSaving(true);
    try {
      const updatedTags = [...tags, newTag.trim()];

      const formData = new FormData();
      formData.append('tags', JSON.stringify(updatedTags));

      const response = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
        setTags(updatedTags);
      }

      setNewTag('');
    } catch (error) {
      console.error('Error adding tag:', error);
      setError({ type: 'error', message: 'Failed to add tag. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const deleteTag = async (tagToDelete) => {
    setSaving(true);
    try {
      const updatedTags = tags.filter(tag => tag !== tagToDelete);

      const formData = new FormData();
      formData.append('tags', JSON.stringify(updatedTags));

      const response = await api.put('/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.user) {
        updateUser(response.data.user);
        setTags(updatedTags);
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError({ type: 'error', message: 'Failed to delete tag. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

        const handleDeleteAccount = async () => {
      setDeletingAccount(true);
      setDeleteStage('deleting');
      setDeleteProgress(0);
      
      // Stage 1: Backing up data
      setDeleteMessage('Preparing to erase everythin...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeleteProgress(20);
      
      // Stage 2: Removing connections
      setDeleteMessage('Removing your information...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeleteProgress(40);
      
      // Stage 3: Erasing profile
      setDeleteMessage('Erasing activity and history...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeleteProgress(60);
      
      // Stage 4: Clearing cache
      setDeleteMessage('Closing this chapter...');
      await new Promise(resolve => setTimeout(resolve, 800));
      setDeleteProgress(80);
      
      try {
        // Stage 5: Final deletion
        setDeleteMessage('Account deleted...');
        await api.delete('/profile/delete-account');
        setDeleteProgress(100);
        
        // Show completion message
        setDeleteStage('complete');
        setDeleteMessage('Account deleted successfully!');
        
        // Wait 2 seconds before redirecting
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Logout and redirect to home
        logout();
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        setError({ 
          type: 'error', 
          message: error.response?.data?.message || 'Failed to delete account. Please try again.' 
        });
        setDeletingAccount(false);
        setShowDeleteModal(false);
        setDeleteStage('confirm');
        setDeleteProgress(0);
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
    ? (user.profilePicture.startsWith('/avatars/') ? user.profilePicture : `/avatars/${user.profilePicture}`)
    : null;

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#FFF5F7',
      borderColor: state.isFocused ? '#E66386' : '#FFE0E9',
      borderWidth: '2px',
      borderRadius: '8px',
      padding: '4px 8px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#E66386'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#FFFFFF',
      border: '2px solid #FFB3C6',
      borderRadius: '8px',
      marginTop: '4px',
      boxShadow: '0 4px 12px rgba(230, 99, 134, 0.15)',
      zIndex: 9999
    }),
    menuList: (provided) => ({
      ...provided,
      padding: 0,
      maxHeight: '200px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#E66386' : state.isFocused ? '#FFE0E9' : '#FFFFFF',
      color: state.isSelected ? '#FFFFFF' : '#2D2D2D',
      cursor: 'pointer',
      padding: '10px',
      borderBottom: '1px solid #FFE0E9',
      '&:last-child': {
        borderBottom: 'none'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#FFE0E9',
      borderRadius: '6px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#E66386',
      fontWeight: '600'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#E66386',
      ':hover': {
        backgroundColor: '#FFB3C6',
        color: '#FFFFFF'
      }
    }),
    loadingIndicator: () => ({
      display: 'none'
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: '#999999',
      padding: '10px'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#999999'
    }),
    input: (provided) => ({
      ...provided,
      color: '#2D2D2D'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#2D2D2D'
    })
  };

  return (
    <div className="home-page">
      <Navbar onLogout={handleLogout} activeTab="home" />
      {error && (
  <div className={`themed-notification ${error.type || 'error'}`}>
    <div className="notification-content">
      <span className="notification-icon">
        {error.type === 'success' ? '✓' : '⚠'}
      </span>
      <span className="notification-message">{error.message || error}</span>
      <button 
        className="notification-close"
        onClick={() => setError(null)}
      >
        ✕
      </button>
    </div>
  </div>
)}
      <div className="home-content">
        <div className="welcome-section">
          <h1>As-salāmu 'alaykum, {user.firstName}! 💕</h1>
          <p className="welcome-text">Ready to find your perfect match?</p>
        </div>

        <div className="profile-layout">
          <div className="left-column">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-picture-container">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt="Profile" className="profile-picture" />
                  ) : (
                    <div className="profile-picture-placeholder">
                      <span className="placeholder-icon">👤</span>
                    </div>
                  )}
                </div>
                <h2>{user.firstName} {user.lastName}</h2>
              </div>

              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">📧 Email</span>
                  <span className="info-value">{user.email}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">⚥ Gender</span>
                  <span className="info-value">{user.gender}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">🎂 Age</span>
                  <span className="info-value">{calculateAge(user.dateOfBirth)} years</span>
                </div>

                {/* Ethnicity */}
                <div className="info-row editable">
                  {editingField === 'ethnicity' ? (
                    <>
                      <span className="info-label">🌍 Ethnicity *</span>
                      <div className="edit-controls">
                        <Select
                          options={ethnicityOptions}
                          value={ethnicityOptions.find(opt => opt.value === editValue)}
                          onChange={(option) => setEditValue(option.value)}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Select ethnicity..."
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

                {/* Height */}
                <div className="info-row editable">
                  {editingField === 'height' ? (
                    <>
                      <span className="info-label">📏 Height *</span>
                      <div className="edit-controls">
                        <Select
                          options={feetOptions}
                          value={heightFeet}
                          onChange={setHeightFeet}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Feet"
                          autoFocus
                        />
                        <Select
                          options={inchesOptions}
                          value={heightInches}
                          onChange={setHeightInches}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Inches"
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

                {/* Marital Status */}
                <div className="info-row editable">
                  {editingField === 'maritalStatus' ? (
                    <>
                      <span className="info-label">💍 Marital Status *</span>
                      <div className="edit-controls">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        >
                          <option value="">Select...</option>
                          <option value="Never Married">Never Married</option>
                          <option value="Annulled/Dissolved">Annulled/Dissolved</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                          <option value="Married">Married</option>
                        </select>
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

                {/* Birth Place */}
                <div className="info-row editable">
                  {editingField === 'birthPlace' ? (
                    <>
                      <span className="info-label">🏠 Birth Place *</span>
                      <div className="edit-controls">
                        <Select
                          options={birthPlaceOptions}
                          value={selectedBirthPlace}
                          onChange={setSelectedBirthPlace}
                          onInputChange={(value) => handleLocationInputChange(value, 'birthPlace')}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Type city name"
                          isLoading={loadingBirthPlace}
                          isClearable
                          isSearchable
                          noOptionsMessage={() => "No locations found"}
                          loadingMessage={LoadingMessage}
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                          }}
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

                {/* Current Location */}
                <div className="info-row editable">
                  {editingField === 'currentLocation' ? (
                    <>
                      <span className="info-label">📍 Current Location *</span>
                      <div className="edit-controls">
                        <Select
                          options={currentLocationOptions}
                          value={selectedCurrentLocation}
                          onChange={setSelectedCurrentLocation}
                          onInputChange={(value) => handleLocationInputChange(value, 'currentLocation')}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Type city name"
                          isLoading={loadingCurrentLocation}
                          isClearable
                          isSearchable
                          noOptionsMessage={() => "No locations found"}
                          loadingMessage={LoadingMessage}
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null
                          }}
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
                      <span className="info-label">📍 Current Location *</span>
                      <span className="info-value">{user.currentLocation || 'Required'}</span>
                    </>
                  )}
                </div>
                
                 {/* Residency Status */}
                <div className="info-row editable">
                  {editingField === 'residencyStatus' ? (
                    <>
                      <span className="info-label">🛂 Residency Status *</span>
                      <div className="edit-controls">
                        <Select
                          options={residencyStatusOptions}
                          value={residencyStatusOptions.find(opt => opt.value === editValue)}
                          onChange={(option) => setEditValue(option.value)}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Select residency status..."
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
                      <button className="edit-icon" onClick={() => startEditing('residencyStatus', user.residencyStatus)}>
                        ✏️
                      </button>
                      <span className="info-label">🛂 Residency Status *</span>
                      <span className="info-value">{user.residencyStatus || 'Required'}</span>
                    </>
                  )}
                </div>


                {/* Profession */}
                <div className="info-row editable">
                  {editingField === 'profession' ? (
                    <>
                      <span className="info-label">💼 Profession *</span>
                      <div className="edit-controls">
                        <Select
                          options={professionOptions}
                          value={professionOptions.find(opt => opt.value === editValue)}
                          onChange={(option) => setEditValue(option.value)}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Select or search..."
                          autoFocus
                          isSearchable
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

                {/* Education */}
                <div className="info-row editable">
                  {editingField === 'education' ? (
                    <>
                      <span className="info-label">🎓 Education *</span>
                      <div className="edit-controls">
                        <Select
                          options={educationOptions}
                          value={educationOptions.find(opt => opt.value === editValue)}
                          onChange={(option) => setEditValue(option.value)}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Select education..."
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

                {/* Languages */}
                <div className="info-row editable">
                  {editingField === 'languages' ? (
                    <>
                      <span className="info-label">🗣️ Languages *</span>
                      <div className="edit-controls">
                        <Select
                          options={languageOptions}
                          value={selectedLanguages}
                          onChange={setSelectedLanguages}
                          onKeyDown={handleKeyDown}
                          styles={customSelectStyles}
                          placeholder="Select languages..."
                          isMulti
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

                {/* Phone Number */}
                <div className="info-row editable">
                  {editingField === 'phoneNumber' ? (
                    <>
                      <span className="info-label">📱 Phone Number *</span>
                      <div className="edit-controls">
                        <input
                          type="tel"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
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
                      <span className="info-value">{user.phoneNumber || 'Required'}</span>
                    </>
                  )}
                </div>
                <p className="privacy-hint">Your phone number will only be visible to people you match with</p>
              </div>

              {/* Custom Fields */}
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

              {/* Tags Display Section */}
              {tags.length > 0 && (
                <div className="tags-display-section">
                  <h3 className="section-title">🏷️ Your Tags</h3>
                  <div className="tags-display-container">
                    {tags.map((tag, index) => (
                      <div key={index} className="display-tag-item">
                        <span className="display-tag-text">{tag}</span>
                        <button
                          className="display-tag-delete-btn"
                          onClick={() => deleteTag(tag)}
                          disabled={saving}
                          title="Remove tag"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="add-info-btn" onClick={() => setShowAddInfo(true)}>
                ➕ Add Tags
              </button>

              <div className={`completion-status ${user.profileCompleted ? 'complete' : 'incomplete'}`}>
                <div className="status-icon">{user.profileCompleted ? '✅' : '⚠️'}</div>
                <div className="status-text">
                  <strong>{user.profileCompleted ? 'Profile Complete!' : 'Profile Incomplete'}</strong>
                  <p>{user.profileCompleted ? 'You can now Search profiles' : 'Fill all required (*) fields to complete'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            <div className="matches-card">
              <div className="card-header">
                <h3>💕 Matches</h3>
                <span className="match-count">{matches.length}</span>
              </div>
              <div className="matches-content">
                {loadingMatches ? (
                  <div className="loading-matches">
                    <p>Loading matches...</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="no-matches">
                    <span className="empty-icon">💔</span>
                    <p>No matches yet</p>
                    <p className="hint">
                      {user.profileCompleted 
                        ? 'Start searching to find your perfect match!' 
                        : 'Complete your profile to start searching!'}
                    </p>
                  </div>
                ) : (
                  <div className="matches-list">
                    {matches.map((match) => (
                      <div key={match.connectionId} className="match-item">
                        <div className="match-avatar">
                          {match.user.profilePicture ? (
                            <img 
                              src={match.user.profilePicture.startsWith('/avatars/') 
                                ? match.user.profilePicture 
                                : `/avatars/${match.user.profilePicture}`} 
                              alt={match.user.firstName}
                              className="match-avatar-img"
                            />
                          ) : (
                            <div className="match-avatar-placeholder">
                              {match.user.firstName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="match-info">
                          <h4>{match.user.firstName}</h4>
                          <p className="match-location">{match.user.currentLocation || 'Location not set'}</p>
                        </div>
                        <button 
                          className="view-match-btn"
                          onClick={() => navigate('/matches')}
                          title="View full profile"
                        >
                          👁️
                        </button>
                      </div>
                    ))}
                    <button 
                      className="view-all-matches-btn"
                      onClick={() => navigate('/matches')}
                    >
                      View All Matches →
                    </button>
                  </div>
                )}
              </div>
            </div>

           <div className="stats-card">
              <div className="card-header">
                <h3>📊 Your Statistics</h3>
              </div>
              <div className="stats-content">
                <div 
                  className="stat-item clickable" 
                  onClick={() => navigate('/matches')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-icon">💝</div>
                  <div className="stat-info">
                    <span className="stat-value">{pendingCount}</span>
                    <span className="stat-label">Connection Requests</span>
                  </div>
                </div>
                <div 
                  className="stat-item clickable" 
                  onClick={() => navigate('/matches')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="stat-icon">💬</div>
                  <div className="stat-info">
                    <span className="stat-value">{matches.length}</span>
                    <span className="stat-label">Active Conversations</span>
                  </div>
                </div>
              </div>
              <p className="stats-note">Statistics will update as you use the platform</p>
                {/* ADD THIS BUTTON HERE */}
                <button 
                  className="delete-account-btn"
                  onClick={() => setShowDeleteModal(true)}
                >
                  🗑️ Delete Account
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Tag Modal */}
      {showAddInfo && (
        <div className="modal-overlay" onClick={() => setShowAddInfo(false)}>
          <div className="add-info-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAddInfo(false)}>✕</button>
            <h3>Add Tags</h3>
            <p className="modal-subtitle">
              Add tags to describe yourself (Hafidh, 2 Brothers,  MJCET, Hanafi, No Dargha, Hijab, Beard etc.)
            </p>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Tag ({newTag.length}/20 characters)</label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      setNewTag(e.target.value);
                    }
                  }}
                  placeholder="Hafidh, 2 Brothers, MJCET, Hanafi, No Dargha, Hijab, Beard"
                  maxLength={20}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTag.trim() && newTag.length <= 20 && tags.length < 10) {
                      addTag();
                    }
                  }}
                />
                <p className="character-count">
                  {newTag.length}/20 characters • {tags.length}/10 tags
                </p>
              </div>

              {/* Display current tags */}
              {tags.length > 0 && (
                <div className="modal-tags-preview">
                  <label>Your Tags:</label>
                  <div className="tags-container">
                    {tags.map((tag, index) => (
                      <div key={index} className="tag-item">
                        <span className="tag-text">{tag}</span>
                        <button
                          className="tag-delete-btn"
                          onClick={() => deleteTag(tag)}
                          disabled={saving}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-buttons">
                <button 
                  className="modal-save-btn" 
                  onClick={addTag}
                  disabled={saving || !newTag.trim() || newTag.length > 20 || tags.length >= 10}
                >
                  {saving ? 'Adding...' : tags.length >= 10 ? 'Max Tags Reached' : 'Add Tag'}
                </button>
                <button className="modal-cancel-btn" onClick={() => setShowAddInfo(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


              
        {/* Delete Account Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => !deletingAccount && setShowDeleteModal(false)}>
            <div className="delete-account-modal" onClick={(e) => e.stopPropagation()}>
              
              {/* STAGE 1: Confirmation */}
              {deleteStage === 'confirm' && (
                <>
                  <div className="delete-modal-icon">⚠️</div>
                  <h3>Delete Account?</h3>
                  <p className="delete-modal-warning">
                    This action is <strong>permanent</strong> and cannot be undone. 
                    All your data, matches, and conversations will be permanently deleted.
                  </p>
                  <p className="delete-modal-confirm">
                    Are you sure you want to delete your account?
                  </p>
                  
                  <div className="delete-modal-buttons">
                    <button 
                      className="delete-confirm-btn" 
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                    >
                      {deletingAccount ? 'Processing...' : 'Yes, Delete My Account'}
                    </button>
                    <button 
                      className="delete-cancel-btn" 
                      onClick={() => setShowDeleteModal(false)}
                      disabled={deletingAccount}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {/* STAGE 2: Deleting Progress */}
              {deleteStage === 'deleting' && (
                <>
                  <div className="delete-modal-icon deleting">🗑️</div>
                  <h3>Deleting Account...</h3>
                  <p className="delete-progress-message">{deleteMessage}</p>
                  
                  <div className="delete-progress-container">
                    <div className="delete-progress-bar">
                      <div 
                        className="delete-progress-fill" 
                        style={{ width: `${deleteProgress}%` }}
                      >
                        <span className="delete-progress-text">{deleteProgress}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="delete-loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </>
              )}

              {/* STAGE 3: Completion */}
              {deleteStage === 'complete' && (
                <>
                  <div className="delete-modal-icon complete">✓</div>
                  <h3>Account Deleted</h3>
                  <p className="delete-complete-message">
                    Your account has been successfully deleted.
                    <br />
                    We'll miss you! 💔
                  </p>
                  
                  <div className="delete-complete-spinner">
                    <div className="spinner"></div>
                    <p>Redirecting you...</p>
                  </div>
                </>
              )}
              
            </div>
          </div>
        )}
    </div>
  );
}

export default HomePage;