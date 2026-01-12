import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './BrowsePage.css';

function BrowsePage() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sending, setSending] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    ethnicity: 'Any',
    minHeight: '',
    maxHeight: '',
    maritalStatus: 'Any',
    birthPlace: 'Any',
    location: 'Any',
    profession: 'Any',
    education: 'Any',
    languages: 'Any'
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;

      setLoadingProfiles(true);
      try {
        const response = await api.get('/browse/profiles');
        if (response.data.profiles) {
          // Filter by opposite gender
          const oppositeGenderProfiles = response.data.profiles.filter(
            profile => profile.gender !== user.gender
          );
          setProfiles(oppositeGenderProfiles);
          setFilteredProfiles(oppositeGenderProfiles);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, [user]);

  // Calculate age
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

  // Extract height number for filtering
  const extractHeight = (heightStr) => {
    if (!heightStr) return null;
    const match = heightStr.match(/(\d+)/);
    return match ? parseInt(match[0]) : null;
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...profiles];

    // Age filter
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
    if (filters.ethnicity !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.ethnicity && profile.ethnicity.toLowerCase().includes(filters.ethnicity.toLowerCase())
      );
    }

    // Height filter
    if (filters.minHeight) {
      filtered = filtered.filter(profile => {
        const height = extractHeight(profile.height);
        return height && height >= parseInt(filters.minHeight);
      });
    }
    if (filters.maxHeight) {
      filtered = filtered.filter(profile => {
        const height = extractHeight(profile.height);
        return height && height <= parseInt(filters.maxHeight);
      });
    }

    // Marital Status filter
    if (filters.maritalStatus !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.maritalStatus === filters.maritalStatus
      );
    }

    // Birth Place filter
    if (filters.birthPlace !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.birthPlace && profile.birthPlace.toLowerCase().includes(filters.birthPlace.toLowerCase())
      );
    }

    // Location filter
    if (filters.location !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.currentLocation && profile.currentLocation.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Profession filter
    if (filters.profession !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.profession && profile.profession.toLowerCase().includes(filters.profession.toLowerCase())
      );
    }

    // Education filter
    if (filters.education !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.education && profile.education.toLowerCase().includes(filters.education.toLowerCase())
      );
    }

    // Languages filter
    if (filters.languages !== 'Any') {
      filtered = filtered.filter(profile => 
        profile.languages && profile.languages.some(lang => 
          lang.toLowerCase().includes(filters.languages.toLowerCase())
        )
      );
    }

    setFilteredProfiles(filtered);
  }, [filters, profiles]);

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      ethnicity: 'Any',
      minHeight: '',
      maxHeight: '',
      maritalStatus: 'Any',
      birthPlace: 'Any',
      location: 'Any',
      profession: 'Any',
      education: 'Any',
      languages: 'Any'
    });
  };

  // Open profile modal
  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  // Close profile modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  // Send connection request
  const sendConnectionRequest = async () => {
    if (!selectedProfile) return;

    setSending(true);
    try {
      await api.post('/connections/request', {
        receiverId: selectedProfile._id
      });
      alert('Connection request sent successfully!');
      closeProfileModal();
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert(error.response?.data?.message || 'Failed to send connection request');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || loadingProfiles) {
    return (
      <div className="browse-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profileImageUrl = (picturePath) => {
    return picturePath
      ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${picturePath}`
      : null;
  };

  return (
    <div className="browse-page">
      <Navbar onLogout={handleLogout} activeTab="browse" />

      <div className="browse-content">
        {/* Quranic Verse */}
        <div className="verse-section">
          <p className="verse-text">
            "He is the One Who created you from a single soul, and made from it its mate, 
            so that he may find comfort in her."
          </p>
          <p className="verse-reference">— Surah Al-A'raf (7:189)</p>
        </div>

        {/* Header */}
        <div className="browse-header">
          <h1>Find Your Naseeb 💕</h1>
          <p className="browse-subtitle">Discover profiles that match your preferences</p>
        </div>

        {/* Browse Layout */}
        <div className="browse-layout">
          {/* Filters Sidebar */}
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
                  onChange={(e) => handleFilterChange('minAge', e.target.value)}
                  min="18"
                  max="100"
                />
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Max"
                  value={filters.maxAge}
                  onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                  min="18"
                  max="100"
                />
              </div>
            </div>

            {/* Ethnicity Filter */}
            <div className="filter-group">
              <label className="filter-label">Ethnicity</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Any"
                value={filters.ethnicity === 'Any' ? '' : filters.ethnicity}
                onChange={(e) => handleFilterChange('ethnicity', e.target.value || 'Any')}
              />
            </div>

            {/* Height Filter */}
            <div className="filter-group">
              <label className="filter-label">Height (cm)</label>
              <div className="min-max-inputs">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Min"
                  value={filters.minHeight}
                  onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                  min="100"
                  max="250"
                />
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Max"
                  value={filters.maxHeight}
                  onChange={(e) => handleFilterChange('maxHeight', e.target.value)}
                  min="100"
                  max="250"
                />
              </div>
            </div>

            {/* Marital Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Marital Status</label>
              <select
                className="filter-select"
                value={filters.maritalStatus}
                onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
              >
                <option value="Any">Any</option>
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <label className="filter-label">Location</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Any"
                value={filters.location === 'Any' ? '' : filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value || 'Any')}
              />
            </div>

            {/* Profession Filter */}
            <div className="filter-group">
              <label className="filter-label">Profession</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Any"
                value={filters.profession === 'Any' ? '' : filters.profession}
                onChange={(e) => handleFilterChange('profession', e.target.value || 'Any')}
              />
            </div>

            {/* Education Filter */}
            <div className="filter-group">
              <label className="filter-label">Education</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Any"
                value={filters.education === 'Any' ? '' : filters.education}
                onChange={(e) => handleFilterChange('education', e.target.value || 'Any')}
              />
            </div>

            {/* Languages Filter */}
            <div className="filter-group">
              <label className="filter-label">Languages</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Any"
                value={filters.languages === 'Any' ? '' : filters.languages}
                onChange={(e) => handleFilterChange('languages', e.target.value || 'Any')}
              />
            </div>

            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>

          {/* Profiles Grid */}
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
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="profile-modal-overlay" onClick={closeProfileModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <button className="modal-close-btn" onClick={closeProfileModal}>✕</button>
            </div>

            <div className="profile-modal-content">
              {/* Avatar Section */}
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

              {/* Profile Info Grid */}
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

              {/* Additional Info Section */}
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

            {/* Connect Button */}
            <div className="connect-button-section">
              <button
                className="connect-btn"
                onClick={sendConnectionRequest}
                disabled={sending}
              >
                {sending ? 'Sending Request...' : '💕 Send Connection Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowsePage;