import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './BrowsePage.css';

// Ethnicity options - NOW MULTI-SELECT
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

// Residency Status options - NOW MULTI-SELECT
const residencyStatusOptions = [
  { value: 'Citizen', label: 'Citizen' },
  { value: 'Permanent Resident (PR)', label: 'Permanent Resident (PR)' },
  { value: 'Student Visa', label: 'Student Visa' },
  { value: 'Work Permit', label: 'Work Permit' },
  { value: 'Visitor / Tourist', label: 'Visitor / Tourist' },
  { value: 'Other', label: 'Other' }
];

// Marital Status options - NOW MULTI-SELECT
const maritalStatusOptions = [
  { value: 'Never Married', label: 'Never Married' },
  { value: 'Annulled/Dissolved', label: 'Annulled/Dissolved' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Married', label: 'Married' }
];

// Education options - NOW MULTI-SELECT
const educationOptions = [
  { value: 'High School Diploma', label: 'High School Diploma' },
  { value: 'College Diploma', label: 'College Diploma' },
  { value: "Bachelor's Degree", label: "Bachelor's Degree" },
  { value: "Master's Degree", label: "Master's Degree" },
  { value: 'Doctorate', label: 'Doctorate' },
  { value: 'Other / Prefer Not to Say', label: 'Other / Prefer Not to Say' }
];

// Profession options - NOW MULTI-SELECT
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
  
  // ✅ NEW: Filter collapse state for mobile
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // ✅ Location autocomplete states
  const debounceTimer = useRef(null);
  const [birthPlaceOptions, setBirthPlaceOptions] = useState([]);
  const [currentLocationOptions, setCurrentLocationOptions] = useState([]);
  const [loadingBirthPlace, setLoadingBirthPlace] = useState(false);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  
  // ✅ Country states
  const [countryOptions, setCountryOptions] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // ✅ UPDATED: Filter states - NOW WITH MULTI-SELECT COUNTRY FILTERS
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    ethnicity: [],
    minHeightFeet: { value: '', label: 'Any' },
    minHeightInches: { value: '', label: 'Any' },
    maxHeightFeet: { value: '', label: 'Any' },
    maxHeightInches: { value: '', label: 'Any' },
    maritalStatus: [],
    birthCountry: [],
    birthPlace: [],
    currentCountry: [],
    location: [],
    residencyStatus: [],
    profession: [],
    education: [],
    languages: [],
    tags: ''
  });

  // ✅ NEW: Detect if mobile screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  

  // ✅ Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await api.get('/profile/countries');
        setCountryOptions(response.data.countries || []);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountryOptions([]);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

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

  // ✅ City search with country parameter
  const fetchLocationSuggestionsEnhanced = async (query, setOptions, setLoading, country = null) => {
    if (query.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const url = country 
        ? `/profile/search-cities?query=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`
        : `/profile/search-cities?query=${encodeURIComponent(query)}`;
      
      const response = await api.get(url);
      setOptions(response.data.cities || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Debounced city search - now uses country.value (country code) instead of country.label
  const handleLocationInputChange = (inputValue, field) => {
    const setOptions = field === 'birthPlace' ? setBirthPlaceOptions : setCurrentLocationOptions;
    const setLoading = field === 'birthPlace' ? setLoadingBirthPlace : setLoadingCurrentLocation;
    
    // ✅ FIXED: Use country.value (country code like "IN", "CA") instead of country.label
    const countries = field === 'birthPlace' ? filters.birthCountry : filters.currentCountry;
    const country = (countries && countries.length > 0) ? countries[0].value : null;
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    if (inputValue.length >= 2) {
      setLoading(true);
    } else {
      setOptions([]);
      setLoading(false);
      return;
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchLocationSuggestionsEnhanced(inputValue, setOptions, setLoading, country);
    }, 150);
  };

  // ✅ Clear cities when country changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, birthPlace: [] }));
    setBirthPlaceOptions([]);
  }, [filters.birthCountry]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, location: [] }));
    setCurrentLocationOptions([]);
  }, [filters.currentCountry]);

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

  // ✅ FIXED: Filtering logic now uses country.value (country code) with more precise matching
  useEffect(() => {
    let filtered = [...profiles];

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

    if (filters.ethnicity.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.ethnicity) return false;
        return filters.ethnicity.some(filterEth => 
          profile.ethnicity.toLowerCase().includes(filterEth.value.toLowerCase())
        );
      });
    }

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

    if (filters.maritalStatus.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.maritalStatus) return false;
        return filters.maritalStatus.some(filterStatus => 
          profile.maritalStatus === filterStatus.value
        );
      });
    }

    // ✅ FIXED: Birth Place filter - now uses country.value (country code) with precise matching
    if (filters.birthPlace.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.birthPlace) return false;
        return filters.birthPlace.some(filterPlace => 
          profile.birthPlace.toLowerCase().includes(filterPlace.value.toLowerCase())
        );
      });
    } else if (filters.birthCountry && filters.birthCountry.length > 0) {
      // ✅ FIXED: Filter by country codes - check if location ends with country code
      filtered = filtered.filter(profile => {
        if (!profile.birthPlace) return false;
        const locationLower = profile.birthPlace.toLowerCase().trim();
        return filters.birthCountry.some(filterCountry => {
          const countryCode = filterCountry.value.toLowerCase();
          // Check if location ends with the country code (e.g., ", ca" or ", au")
          return locationLower.endsWith(`, ${countryCode}`) || 
                 locationLower.endsWith(` ${countryCode}`) ||
                 locationLower === countryCode;
        });
      });
    }

    // ✅ FIXED: Current Location filter - now uses country.value (country code) with precise matching
    if (filters.location.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.currentLocation) return false;
        return filters.location.some(filterLoc => 
          profile.currentLocation.toLowerCase().includes(filterLoc.value.toLowerCase())
        );
      });
    } else if (filters.currentCountry && filters.currentCountry.length > 0) {
      // ✅ FIXED: Filter by country codes - check if location ends with country code
      filtered = filtered.filter(profile => {
        if (!profile.currentLocation) return false;
        const locationLower = profile.currentLocation.toLowerCase().trim();
        return filters.currentCountry.some(filterCountry => {
          const countryCode = filterCountry.value.toLowerCase();
          // Check if location ends with the country code (e.g., ", ca" or ", au")
          return locationLower.endsWith(`, ${countryCode}`) || 
                 locationLower.endsWith(` ${countryCode}`) ||
                 locationLower === countryCode;
        });
      });
    }

    if (filters.residencyStatus.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.residencyStatus) return false;
        return filters.residencyStatus.some(filterStatus => 
          profile.residencyStatus === filterStatus.value
        );
      });
    }

    if (filters.profession.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.profession) return false;
        return filters.profession.some(filterProf => 
          profile.profession.toLowerCase().includes(filterProf.value.toLowerCase())
        );
      });
    }

    if (filters.education.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.education) return false;
        return filters.education.some(filterEdu => 
          profile.education.toLowerCase().includes(filterEdu.value.toLowerCase())
        );
      });
    }

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

  // ✅ UPDATED: Clear filters with empty arrays for countries
  const clearFilters = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      ethnicity: [],
      minHeightFeet: { value: '', label: 'Any' },
      minHeightInches: { value: '', label: 'Any' },
      maxHeightFeet: { value: '', label: 'Any' },
      maxHeightInches: { value: '', label: 'Any' },
      maritalStatus: [],
      birthCountry: [],
      birthPlace: [],
      currentCountry: [],
      location: [],
      residencyStatus: [],
      profession: [],
      education: [],
      languages: [],
      tags: ''
    });
    setBirthPlaceOptions([]);
    setCurrentLocationOptions([]);
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

  // Custom select styles
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
    }),
    loadingIndicator: () => ({
      display: 'none'
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: '#999999',
      padding: '10px'
    })
  };

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
            {/* ✅ NEW: Collapsible filters for mobile */}
            <div className={`filters-sidebar ${isMobile && !filtersExpanded ? 'collapsed' : ''}`}>
              {/* ✅ NEW: Toggle button for mobile */}
              {isMobile && (
                <button 
                  className="filters-toggle-btn"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                >
                  {filtersExpanded ? '✕ Hide Filters' : '🔍 Show Filters'}
                </button>
              )}

              {/* ✅ Filters content - hidden when collapsed on mobile */}
              <div className={`filters-content ${isMobile && !filtersExpanded ? 'hidden' : ''}`}>
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

                {/* Ethnicity Filter */}
                <div className="filter-group">
                  <label className="filter-label">Ethnicity</label>
                  <Select
                    options={ethnicityOptions}
                    value={filters.ethnicity}
                    onChange={(options) => setFilters(prev => ({ ...prev, ethnicity: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select ethnicities..."
                    isMulti
                  />
                </div>

                {/* Height Filters */}
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

                {/* Marital Status */}
                <div className="filter-group">
                  <label className="filter-label">Marital Status</label>
                  <Select
                    options={maritalStatusOptions}
                    value={filters.maritalStatus}
                    onChange={(options) => setFilters(prev => ({ ...prev, maritalStatus: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select statuses..."
                    isMulti
                  />
                </div>

                {/* Birth Country Filter */}
                <div className="filter-group">
                  <label className="filter-label">Birth Country</label>
                  <Select
                    options={countryOptions}
                    value={filters.birthCountry}
                    onChange={(options) => setFilters(prev => ({ ...prev, birthCountry: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select countries..."
                    isLoading={loadingCountries}
                    isClearable
                    isSearchable
                    isMulti
                  />
                </div>

                {/* Birth City */}
                <div className="filter-group">
                  <label className="filter-label">Birth City</label>
                  <Select
                    options={birthPlaceOptions}
                    value={filters.birthPlace}
                    onChange={(options) => setFilters(prev => ({ ...prev, birthPlace: options || [] }))}
                    onInputChange={(value) => handleLocationInputChange(value, 'birthPlace')}
                    styles={customSelectStyles}
                    placeholder={
                      filters.birthCountry && filters.birthCountry.length > 0
                        ? "Type city names..." 
                        : "Select country first"
                    }
                    isLoading={loadingBirthPlace}
                    isClearable
                    isSearchable
                    isMulti
                    isDisabled={!filters.birthCountry || filters.birthCountry.length === 0}
                    noOptionsMessage={() => 
                      filters.birthCountry && filters.birthCountry.length > 0
                        ? "Type to search cities" 
                        : "Select a country first"
                    }
                    loadingMessage={LoadingMessage}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null
                    }}
                  />
                  <p className="filter-hint">
                    {filters.birthCountry && filters.birthCountry.length > 0
                      ? filters.birthCountry.length > 1
                        ? `Searching in ${filters.birthCountry[0].label} (first selected country)`
                        : "Type and select multiple cities"
                      : "Select a country first"}
                  </p>
                </div>

                {/* Current Country Filter */}
                <div className="filter-group">
                  <label className="filter-label">Current Country</label>
                  <Select
                    options={countryOptions}
                    value={filters.currentCountry}
                    onChange={(options) => setFilters(prev => ({ ...prev, currentCountry: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select countries..."
                    isLoading={loadingCountries}
                    isClearable
                    isSearchable
                    isMulti
                  />
                </div>

                {/* Current City */}
                <div className="filter-group">
                  <label className="filter-label">Current City</label>
                  <Select
                    options={currentLocationOptions}
                    value={filters.location}
                    onChange={(options) => setFilters(prev => ({ ...prev, location: options || [] }))}
                    onInputChange={(value) => handleLocationInputChange(value, 'currentLocation')}
                    styles={customSelectStyles}
                    placeholder={
                      filters.currentCountry && filters.currentCountry.length > 0
                        ? "Type city names..." 
                        : "Select country first"
                    }
                    isLoading={loadingCurrentLocation}
                    isClearable
                    isSearchable
                    isMulti
                    isDisabled={!filters.currentCountry || filters.currentCountry.length === 0}
                    noOptionsMessage={() => 
                      filters.currentCountry && filters.currentCountry.length > 0
                        ? "Type to search cities" 
                        : "Select a country first"
                    }
                    loadingMessage={LoadingMessage}
                    components={{
                      DropdownIndicator: () => null,
                      IndicatorSeparator: () => null
                    }}
                  />
                  <p className="filter-hint">
                    {filters.currentCountry && filters.currentCountry.length > 0
                      ? filters.currentCountry.length > 1
                        ? `Searching in ${filters.currentCountry[0].label} (first selected country)`
                        : "Type and select multiple cities"
                      : "Select a country first"}
                  </p>
                </div>

                {/* Residency Status */}
                <div className="filter-group">
                  <label className="filter-label">Residency Status</label>
                  <Select
                    options={residencyStatusOptions}
                    value={filters.residencyStatus}
                    onChange={(options) => setFilters(prev => ({ ...prev, residencyStatus: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select statuses..."
                    isMulti
                  />
                </div>

                {/* Profession */}
                <div className="filter-group">
                  <label className="filter-label">Profession</label>
                  <Select
                    options={professionOptions}
                    value={filters.profession}
                    onChange={(options) => setFilters(prev => ({ ...prev, profession: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select professions..."
                    isMulti
                    isSearchable
                  />
                </div>

                {/* Education */}
                <div className="filter-group">
                  <label className="filter-label">Education</label>
                  <Select
                    options={educationOptions}
                    value={filters.education}
                    onChange={(options) => setFilters(prev => ({ ...prev, education: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select education levels..."
                    isMulti
                  />
                </div>

                {/* Languages */}
                <div className="filter-group">
                  <label className="filter-label">Languages</label>
                  <Select
                    options={languageOptions}
                    value={filters.languages}
                    onChange={(options) => setFilters(prev => ({ ...prev, languages: options || [] }))}
                    styles={customSelectStyles}
                    placeholder="Select languages..."
                    isMulti
                  />
                </div>

                {/* Tags */}
                <div className="filter-group">
                  <label className="filter-label">Tags</label>
                  <input
                    type="text"
                    className="filter-input tags-filter-input"
                    placeholder="Hafidh, MJCET, Beard, Hijab"
                    value={filters.tags}
                    onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
                  />
                  <p className="filter-hint">Separate tags with commas</p>
                </div>

                <button className="clear-filters-btn" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
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

      {/* Profile Modal */}
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