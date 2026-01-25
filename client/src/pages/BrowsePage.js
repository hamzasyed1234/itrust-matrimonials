import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './BrowsePage.css';

// Ethnicity options
const ethnicityOptions = [
  { value: 'Any', label: 'Any' },
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
  { value: '', label: 'Any' },
  { value: 4, label: "4'" },
  { value: 5, label: "5'" },
  { value: 6, label: "6'" },
  { value: 7, label: "7'" }
];

// Height options - Inches (0" to 11")
const inchesOptions = [
  { value: '', label: 'Any' },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: `${i}"`
  }))
];

// Residency Status options
const residencyStatusOptions = [
  { value: 'Any', label: 'Any' },
  { value: 'Citizen', label: 'Citizen' },
  { value: 'Permanent Resident (PR)', label: 'Permanent Resident (PR)' },
  { value: 'Student Visa', label: 'Student Visa' },
  { value: 'Work Permit', label: 'Work Permit' },
  { value: 'Visitor / Tourist', label: 'Visitor / Tourist' },
  { value: 'Other', label: 'Other' }
];

// Education options
const educationOptions = [
  { value: 'Any', label: 'Any' },
  { value: 'High School Diploma', label: 'High School Diploma' },
  { value: 'College Diploma', label: 'College Diploma' },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: 'Doctorate', label: 'Doctorate' },
  { value: 'Other / Prefer Not to Say', label: 'Other / Prefer Not to Say' }
];

// Profession options
const professionOptions = [
  { value: 'Any', label: 'Any' },
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
  { value: 'English', label: 'English' },
  { value: 'Mandarin', label: 'Mandarin' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'German', label: 'German' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Tagalog', label: 'Tagalog' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Swahili', label: 'Swahili' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Persian', label: 'Persian' },
  { value: 'Vietnamese', label: 'Vietnamese' }
];

function BrowsePage() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [error, setError] = useState(null);

  // Filter states - Updated for new filter types
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    ethnicity: { value: 'Any', label: 'Any' },
    minHeightFeet: { value: '', label: 'Any' },
    minHeightInches: { value: '', label: 'Any' },
    maxHeightFeet: { value: '', label: 'Any' },
    maxHeightInches: { value: '', label: 'Any' },
    maritalStatus: 'Any',
    birthPlace: '',
    location: '',
    residencyStatus: { value: 'Any', label: 'Any' },  // ADD THIS LINE
    profession: { value: 'Any', label: 'Any' },
    education: { value: 'Any', label: 'Any' },
    languages: [],
    tags: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Fetch connection statuses
  const fetchConnectionStatuses = async () => {
    try {
      const response = await api.get('/connections/status');
      if (response.data.statuses) {
        const statusMap = {};
        response.data.statuses.forEach(status => {
          statusMap[status.userId] = status.status;
        });
        setConnectionStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error fetching connection statuses:', error);
    }
  };

  // Fetch profiles and connection statuses
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      
      if (!user.profileCompleted) {
        setLoadingProfiles(false);
        return;
      }

      setLoadingProfiles(true);
      try {
        const response = await api.get('/browse/profiles');
        if (response.data.profiles) {
          const oppositeGenderProfiles = response.data.profiles.filter(
            profile => profile.gender !== user.gender
          );
          setProfiles(oppositeGenderProfiles);
          setFilteredProfiles(oppositeGenderProfiles);
        }
        
        await fetchConnectionStatuses();
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setError('Failed to load profiles. Please try again.');
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [user]);

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Convert height string to total inches for comparison
  const heightToInches = (heightStr) => {
    if (!heightStr) return null;
    const match = heightStr.match(/(\d+)'(\d+)"/);
    if (match) {
      const feet = parseInt(match[1]);
      const inches = parseInt(match[2]);
      return (feet * 12) + inches;
    }
    return null;
  };

  // Updated filtering logic
  useEffect(() => {
    let filtered = [...profiles];

    // Age filters
    if (filters.minAge) {
      filtered = filtered.filter(profile => {
        const age = calculateAge(profile.dateOfBirth);
        return age >= parseInt(filters.minAge);
      });
    }
    if (filters.maxAge) {
      filtered = filtered.filter(profile => {
        const age = calculateAge(profile.dateOfBirth);
        return age <= parseInt(filters.maxAge);
      });
    }

    // Ethnicity filter
    if (filters.ethnicity.value !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.ethnicity && profile.ethnicity.toLowerCase().includes(filters.ethnicity.value.toLowerCase())
      );
    }

    // Height filters - convert to inches for comparison
    if (filters.minHeightFeet.value !== '' || filters.minHeightInches.value !== '') {
      const minFeet = filters.minHeightFeet.value || 0;
      const minInches = filters.minHeightInches.value || 0;
      const minTotalInches = (minFeet * 12) + minInches;
      
      filtered = filtered.filter(profile => {
        const profileHeight = heightToInches(profile.height);
        return profileHeight && profileHeight >= minTotalInches;
      });
    }

    if (filters.maxHeightFeet.value !== '' || filters.maxHeightInches.value !== '') {
      const maxFeet = filters.maxHeightFeet.value || 7;
      const maxInches = filters.maxHeightInches.value || 11;
      const maxTotalInches = (maxFeet * 12) + maxInches;
      
      filtered = filtered.filter(profile => {
        const profileHeight = heightToInches(profile.height);
        return profileHeight && profileHeight <= maxTotalInches;
      });
    }

    // Marital Status filter
    if (filters.maritalStatus !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.maritalStatus === filters.maritalStatus
      );
    }

   // Birth Place filter - supports multiple comma-separated values
    if (filters.birthPlace.trim()) {
      const searchBirthPlaces = filters.birthPlace
        .toLowerCase()
        .split(',')
        .map(place => place.trim())
        .filter(place => place.length > 0);
      
      if (searchBirthPlaces.length > 0) {
        filtered = filtered.filter(profile => {
          if (!profile.birthPlace) return false;
          
          return searchBirthPlaces.some(searchPlace => 
            profile.birthPlace.toLowerCase().includes(searchPlace)
          );
        });
      }
    }

    // Location filter - supports multiple comma-separated values
    if (filters.location.trim()) {
      const searchLocations = filters.location
        .toLowerCase()
        .split(',')
        .map(place => place.trim())
        .filter(place => place.length > 0);
      
      if (searchLocations.length > 0) {
        filtered = filtered.filter(profile => {
          if (!profile.currentLocation) return false;
          
          return searchLocations.some(searchLocation => 
            profile.currentLocation.toLowerCase().includes(searchLocation)
          );
        });
      }
    }
    // Residency Status filter
    if (filters.residencyStatus.value !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.residencyStatus === filters.residencyStatus.value
      );
    }
    // Profession filter
    if (filters.profession.value !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.profession && profile.profession.toLowerCase().includes(filters.profession.value.toLowerCase())
      );
    }

    // Education filter
    if (filters.education.value !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.education && profile.education.toLowerCase().includes(filters.education.value.toLowerCase())
      );
    }

    // Languages filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.languages || profile.languages.length === 0) return false;
        return filters.languages.some(filterLang => 
          profile.languages.some(profileLang => 
            profileLang.toLowerCase().includes(filterLang.value.toLowerCase())
          )
        );
      });
    }

    // Tags filter
    if (filters.tags && filters.tags.trim()) {
      const searchTags = filters.tags
        .toLowerCase()
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      if (searchTags.length > 0) {
        filtered = filtered.filter(profile => {
          if (!profile.tags || !Array.isArray(profile.tags) || profile.tags.length === 0) {
            return false;
          }
          
          return profile.tags.some(profileTag => 
            searchTags.some(searchTag => 
              profileTag.toLowerCase().includes(searchTag)
            )
          );
        });
      }
    }

    setFilteredProfiles(filtered);
  }, [filters, profiles]);

  const clearFilters = () => {
  setFilters({
    minAge: '',
    maxAge: '',
    ethnicity: { value: 'Any', label: 'Any' },
    minHeightFeet: { value: '', label: 'Any' },
    minHeightInches: { value: '', label: 'Any' },
    maxHeightFeet: { value: '', label: 'Any' },
    maxHeightInches: { value: '', label: 'Any' },
    maritalStatus: 'Any',
    birthPlace: '',
    location: '',
    residencyStatus: { value: 'Any', label: 'Any' },  // ADD THIS LINE
    profession: { value: 'Any', label: 'Any' },
    education: { value: 'Any', label: 'Any' },
    languages: [],
    tags: ''
  });
};

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  const sendConnectionRequest = async () => {
    if (!selectedProfile) return;

    setSending(true);
    setError(null);
    try {
      await api.post('/connections/request', {
        receiverId: selectedProfile._id
      });
      
      setConnectionStatuses(prev => ({
        ...prev,
        [selectedProfile._id]: 'pending'
      }));
      
      setError({ type: 'success', message: 'Connection request sent successfully!' });
    } catch (error) {
      console.error('Error sending connection request:', error);
      setError({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send connection request. Please try again.' 
      });
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getConnectionStatus = (profileId) => {
    return connectionStatuses[profileId] || null;
  };

  const renderConnectionButton = () => {
    if (!selectedProfile) return null;
    
    const status = getConnectionStatus(selectedProfile._id);
    
    if (status === 'matched') {
      return (
        <div className="connection-status-display matched">
          🩷 Matched!
        </div>
      );
    }
    
    if (status === 'declined') {
      return (
        <div className="connection-status-display declined">
          ❌ Request Declined
        </div>
      );
    }
    
    if (status === 'pending') {
      return (
        <div className="connection-status-display pending">
          ⏳ Request Sent
        </div>
      );
    }
    
    return (
      <button
        className="connect-btn"
        onClick={sendConnectionRequest}
        disabled={sending}
      >
        {sending ? 'Sending Request...' : '💕 Send Connection Request'}
      </button>
    );
  };

  
if (loading || loadingProfiles) {
  return (
    <div className="browse-page">
      <Navbar onLogout={handleLogout} activeTab="browse" />
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading profiles...</p>
      </div>
    </div>
  );
}

if (!user) {
  return null;
}

  const profileImageUrl = (picturePath) => {
    if (!picturePath) return null;
    
    if (picturePath.startsWith('http://') || picturePath.startsWith('https://')) {
      return picturePath;
    }
    
    if (picturePath.startsWith('/avatars/')) {
      return picturePath;
    }
    
    return `/avatars/${picturePath}`;
  };

  const isProfileIncomplete = !user.profileCompleted;

  // Custom select styles (matching HomePage)
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
    placeholder: (provided) => ({
      ...provided,
      color: '#999999'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#2D2D2D'
    })
  };

  return (
    <div className="browse-page">
      <Navbar onLogout={handleLogout} activeTab="browse" />

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

      <div className="browse-content">
        <div className="verse-section">
          <p className="verse-text">
            "And We created you in pairs."
          </p>
          <p className="verse-reference">— Surah An-Naba (78:8)</p>
        </div>

        {isProfileIncomplete ? (
          <div className="incomplete-profile-section">
            <div className="incomplete-profile-card">
              <div className="incomplete-icon">📝</div>
              <h2 className="incomplete-title">Complete Your Profile</h2>
              <p className="incomplete-message">
                You need to complete your profile before you can view other profiles and connect with potential matches.
              </p>
              <p className="incomplete-hint">
                Adding your details helps others know you better and improves your matching experience!
              </p>
              <button 
                className="complete-profile-btn"
                onClick={() => navigate('/home')}
              >
                ✨ Complete Your Profile Now
              </button>
            </div>
          </div>
        ) : (
          <div className="browse-layout">
            <div className="filters-sidebar">
              <h2 className="filters-header">Filters</h2>

              {/* Age Filter */}
              <div className="filter-group">
                <label className="filter-label">Age</label>
                <div className="min-max-inputs">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min"
                    value={filters.minAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                    min="18"
                    max="100"
                  />
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max"
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
                    min="18"
                    max="100"
                  />
                </div>
              </div>

              {/* Ethnicity Filter - Dropdown */}
              <div className="filter-group">
                <label className="filter-label">Ethnicity</label>
                <Select
                  options={ethnicityOptions}
                  value={filters.ethnicity}
                  onChange={(option) => setFilters(prev => ({ ...prev, ethnicity: option }))}
                  styles={customSelectStyles}
                  placeholder="Any"
                />
              </div>

              {/* Height Filter - Feet and Inches */}
              <div className="filter-group">
                <label className="filter-label">Min Height</label>
                <div className="height-selects">
                  <Select
                    options={feetOptions}
                    value={filters.minHeightFeet}
                    onChange={(option) => setFilters(prev => ({ ...prev, minHeightFeet: option }))}
                    styles={customSelectStyles}
                    placeholder="Feet"
                  />
                  <Select
                    options={inchesOptions}
                    value={filters.minHeightInches}
                    onChange={(option) => setFilters(prev => ({ ...prev, minHeightInches: option }))}
                    styles={customSelectStyles}
                    placeholder="Inches"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Max Height</label>
                <div className="height-selects">
                  <Select
                    options={feetOptions}
                    value={filters.maxHeightFeet}
                    onChange={(option) => setFilters(prev => ({ ...prev, maxHeightFeet: option }))}
                    styles={customSelectStyles}
                    placeholder="Feet"
                  />
                  <Select
                    options={inchesOptions}
                    value={filters.maxHeightInches}
                    onChange={(option) => setFilters(prev => ({ ...prev, maxHeightInches: option }))}
                    styles={customSelectStyles}
                    placeholder="Inches"
                  />
                </div>
              </div>

              {/* Marital Status - Dropdown */}
              <div className="filter-group">
                <label className="filter-label">Marital Status</label>
                <select
                  className="filter-select"
                  value={filters.maritalStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, maritalStatus: e.target.value }))}
                >
                  <option value="Any">Any</option>
                  <option value="Never Married">Never Married</option>
                  <option value="Annulled/Dissolved">Annulled/Dissolved</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              {/* Birth Place - Text Input */}
                <div className="filter-group">
                  <label className="filter-label">Birth Place</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Cairo, United States, London"
                    value={filters.birthPlace}
                    onChange={(e) => setFilters(prev => ({ ...prev, birthPlace: e.target.value }))}
                  />
                  <p className="filter-hint">Separate places with commas</p>
                </div>

                {/* Location - Text Input */}
                <div className="filter-group">
                  <label className="filter-label">Current Location</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="Canada, Hyderabad, New york"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                  <p className="filter-hint">Separate places with commas</p>
                </div>

               {/* Residency Status - Dropdown */}
                <div className="filter-group">
                  <label className="filter-label">Residency Status</label>
                  <Select
                    options={residencyStatusOptions}
                    value={filters.residencyStatus}
                    onChange={(option) => setFilters(prev => ({ ...prev, residencyStatus: option }))}
                    styles={customSelectStyles}
                    placeholder="Any"
                  />
                </div>

              {/* Profession - Dropdown */}
              <div className="filter-group">
                <label className="filter-label">Profession</label>
                <Select
                  options={professionOptions}
                  value={filters.profession}
                  onChange={(option) => setFilters(prev => ({ ...prev, profession: option }))}
                  styles={customSelectStyles}
                  placeholder="Any"
                  isSearchable
                />
              </div>

              {/* Education - Dropdown */}
              <div className="filter-group">
                <label className="filter-label">Education</label>
                <Select
                  options={educationOptions}
                  value={filters.education}
                  onChange={(option) => setFilters(prev => ({ ...prev, education: option }))}
                  styles={customSelectStyles}
                  placeholder="Any"
                />
              </div>

              {/* Languages - Multi-select */}
              <div className="filter-group">
                <label className="filter-label">Languages</label>
                <Select
                  options={languageOptions}
                  value={filters.languages}
                  onChange={(options) => setFilters(prev => ({ ...prev, languages: options || [] }))}
                  styles={customSelectStyles}
                  placeholder="Select languages"
                  isMulti
                />
              </div>

              {/* Tags - Text Input */}
              <div className="filter-group">
                <label className="filter-label">Tags</label>
                <input
                  type="text"
                  className="filter-input tags-filter-input"
                  placeholder="Hafidh, MJCET, Shafi'i"
                  value={filters.tags}
                  onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                />
                <p className="filter-hint">Separate tags with commas</p>
              </div>

              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>

            <div className="profiles-section">
              <p className="profiles-count">
                Showing <span>{filteredProfiles.length}</span> {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
              </p>

              {filteredProfiles.length > 0 ? (
                <div className="profiles-grid">
                  {filteredProfiles.map((profile) => (
                    <div
                      key={profile._id}
                      className="user-card"
                      onClick={() => openProfileModal(profile)}
                    >
                      <div className="user-avatar">
                        {profile.profilePicture ? (
                          <img src={profileImageUrl(profile.profilePicture)} alt={profile.firstName} />
                        ) : (
                          <div className="user-avatar-placeholder">👤</div>
                        )}
                      </div>
                      <h3 className="user-name">{profile.firstName} {profile.lastName}</h3>
                      <div className="user-quick-info">
                        {calculateAge(profile.dateOfBirth)} years • {profile.ethnicity}<br />
                        {profile.currentLocation}
                      </div>
                      {profile.tags && profile.tags.length > 0 && (
                        <div className="user-tags-preview">
                          {profile.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="user-tag-mini">{tag}</span>
                          ))}
                          {profile.tags.length > 3 && (
                            <span className="user-tag-more">+{profile.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <span className="no-results-icon">🔍</span>
                  <p>No profiles match your filters</p>
                  <p className="hint">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showProfileModal && selectedProfile && (
        <div className="profile-modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <button className="modal-close-btn" onClick={closeProfileModal}>✕</button>
            </div>

            <div className="profile-modal-content">
              <div className="modal-avatar-section">
                <div className="modal-avatar">
                  {selectedProfile.profilePicture ? (
                    <img src={profileImageUrl(selectedProfile.profilePicture)} alt={selectedProfile.firstName} />
                  ) : (
                    <div className="modal-avatar-placeholder">👤</div>
                  )}
                </div>
                <h2 className="modal-user-name">{selectedProfile.firstName} {selectedProfile.lastName}</h2>
              </div>

              {selectedProfile.tags && selectedProfile.tags.length > 0 && (
                <div className="profile-tags-section">
                  <h3 className="profile-tags-title">Tags</h3>
                  <div className="profile-tags-container">
                    {selectedProfile.tags.map((tag, index) => (
                      <span key={index} className="profile-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-label">Gender</div>
                  <div className="profile-info-value">{selectedProfile.gender}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Age</div>
                  <div className="profile-info-value">{calculateAge(selectedProfile.dateOfBirth)} years</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Ethnicity</div>
                  <div className="profile-info-value">{selectedProfile.ethnicity || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Height</div>
                  <div className="profile-info-value">{selectedProfile.height || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Marital Status</div>
                  <div className="profile-info-value">{selectedProfile.maritalStatus || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Birth Place</div>
                  <div className="profile-info-value">{selectedProfile.birthPlace || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Current Location</div>
                  <div className="profile-info-value">{selectedProfile.currentLocation || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Residency Status</div>
                  <div className="profile-info-value">{selectedProfile.residencyStatus || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Profession</div>
                  <div className="profile-info-value">{selectedProfile.profession || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Education</div>
                  <div className="profile-info-value">{selectedProfile.education || 'N/A'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Languages</div>
                  <div className="profile-info-value">
                    {selectedProfile.languages && selectedProfile.languages.length > 0
                      ? selectedProfile.languages.join(', ')
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {selectedProfile.customFields && Object.keys(selectedProfile.customFields).length > 0 && (
                <div className="additional-info-section">
                  <h3 className="additional-info-title">Additional Information</h3>
                  {Object.entries(selectedProfile.customFields).map(([key, value]) => (
                    <div key={key} className="additional-info-item">
                      <span className="additional-info-label">{key}</span>
                      <span className="additional-info-value">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="connect-button-section">
              {renderConnectionButton()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowsePage;