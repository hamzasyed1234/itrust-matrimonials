import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './MatchesPage.css';

function MatchesPage() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [acceptedMatches, setAcceptedMatches] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [error, setError] = useState(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false); // ✨ NEW: Decline confirmation


  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch all connection data
  useEffect(() => {
    const fetchConnectionData = async () => {
      setLoadingData(true);
      try {
        // Fetch pending requests (received)
        const pendingResponse = await api.get('/connections/pending');
        console.log('Pending response:', pendingResponse.data);
        if (pendingResponse.data.success) {
          setPendingRequests(pendingResponse.data.requests || []);
        }

        // Fetch sent requests
        const sentResponse = await api.get('/connections/sent');
        console.log('Sent response:', sentResponse.data);
        if (sentResponse.data.success) {
          setSentRequests(sentResponse.data.requests || []);
        }

        // Fetch accepted matches
        const matchesResponse = await api.get('/connections/my-connections');
        console.log('Matches response:', matchesResponse.data);
        if (matchesResponse.data.success) {
          setAcceptedMatches(matchesResponse.data.connections || []);
        }
      } catch (error) {
        console.error('Error fetching connection data:', error);
        console.error('Error details:', error.response?.data);
        setError({ type: 'error', message: 'Failed to load connection data. Please refresh the page.' });
        // Set empty arrays on error to prevent undefined issues
        setPendingRequests([]);
        setSentRequests([]);
        setAcceptedMatches([]);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchConnectionData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Calculate age
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

  // Fixed profile image URL function
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

  // Format phone number for WhatsApp (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  };

  // Open WhatsApp chat
  const openWhatsApp = (phoneNumber) => {
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    const senderName = user?.firstName || 'your match';
    const message = encodeURIComponent(`Assalamu Alaikum! I'm ${senderName}. I matched with you on iTrust Muslim Matrimonials and would like to get to know you better.`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  // View profile
  const handleViewProfile = async (userId, requestId = null) => {
    try {
      const response = await api.get(`/browse/profile-with-status/${userId}`);
      if (response.data.success) {
        setSelectedProfile({ ...response.data.profile, requestId });
        setIsMatched(response.data.isMatched || false);
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError({ type: 'error', message: 'Could not load profile. Please try again.' });
    }
  };

  // Accept connection request
  const handleAcceptRequest = async () => {
    if (!selectedProfile || !selectedProfile.requestId) return;

    setSaving(true);
    setError(null);
    try {
      const response = await api.put(`/connections/accept/${selectedProfile.requestId}`);
      if (response.data.success) {
        // Remove from pending
        setPendingRequests(prev => prev.filter(req => req._id !== selectedProfile.requestId));
        
        // Refresh accepted matches
        const matchesResponse = await api.get('/connections/my-connections');
        if (matchesResponse.data.success) {
          setAcceptedMatches(matchesResponse.data.connections);
        }

        setShowProfileModal(false);
        setSelectedProfile(null);
        setError({ type: 'success', message: '🎉 Connection accepted! You can now see their phone number and connect on WhatsApp.' });
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      setError({ type: 'error', message: error.response?.data?.message || 'Failed to accept connection. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // ✨ NEW: Show decline confirmation
  const handleDeclineClick = () => {
    setShowDeclineConfirm(true);
  };

  // ✨ NEW: Cancel decline
  const handleCancelDecline = () => {
    setShowDeclineConfirm(false);
  };

  // ✨ UPDATED: Decline connection request (now confirms first)
  const handleConfirmDecline = async () => {
    if (!selectedProfile || !selectedProfile.requestId) return;

    setSaving(true);
    setError(null);
    setShowDeclineConfirm(false); // Close confirmation
    
    try {
      const response = await api.put(`/connections/decline/${selectedProfile.requestId}`);
      if (response.data.success) {
        // Remove from pending
        setPendingRequests(prev => prev.filter(req => req._id !== selectedProfile.requestId));
        setShowProfileModal(false);
        setSelectedProfile(null);
        setError({ type: 'success', message: 'Connection request declined.' });
      }
    } catch (error) {
      console.error('Error declining request:', error);
      setError({ type: 'error', message: 'Failed to decline connection. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Early returns for loading and no user
  if (loading) {
    return (
      <div className="matches-page">
        <Navbar onLogout={handleLogout} activeTab="matches" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="matches-page">
      <Navbar onLogout={handleLogout} activeTab="matches" />

      {/* Themed Error/Success Message */}
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

      <div className="matches-content">
        <div className="matches-header">
          <h1>💕 Your Matches</h1>
          <p className="matches-subtitle">Manage your connections and requests</p>
        </div>

        {/* Tabs */}
        <div className="matches-tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Inbox
            {pendingRequests.length > 0 && (
              <span className="tab-badge">{pendingRequests.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent
          </button>
          <button
            className={`tab ${activeTab === 'accepted' ? 'active' : ''}`}
            onClick={() => setActiveTab('accepted')}
          >
            Matches
            <span className="tab-badge">{acceptedMatches.length}</span>
          </button>
        </div>

        {/* Tab Content */}
<div className="tab-content">
  {loadingData ? (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading data...</p>
    </div>
  ) : (
            <>
              {/* Pending Tab */}
              {activeTab === 'pending' && (
                <div className="pending-tab">
                  {pendingRequests.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📭</span>
                      <h3>No Pending Requests</h3>
                      <p>You don't have any connection requests at the moment</p>
                    </div>
                  ) : (
                    <div className="requests-grid">
                      {pendingRequests.map((request) => (
                        <div
                          key={request._id}
                          className="request-card"
                          onClick={() => handleViewProfile(request.sender._id, request._id)}
                        >
                          <div className="card-image">
                            {request.sender.profilePicture ? (
                              <img
                                src={profileImageUrl(request.sender.profilePicture)}
                                alt={request.sender.firstName}
                              />
                            ) : (
                              <div className="placeholder-avatar">👤</div>
                            )}
                          </div>
                          <div className="card-info">
                            <h3>{request.sender.firstName} {request.sender.lastName}</h3>
                            <p className="card-age">{calculateAge(request.sender.dateOfBirth)} years old</p>
                            {request.sender.currentLocation && (
                              <p className="card-location">📍 {request.sender.currentLocation}</p>
                            )}
                            {request.sender.profession && (
                              <p className="card-profession">💼 {request.sender.profession}</p>
                            )}
                            {request.sender.tags && request.sender.tags.length > 0 && (
                              <div className="user-tags-preview">
                                {request.sender.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="user-tag-mini">{tag}</span>
                                ))}
                                {request.sender.tags.length > 3 && (
                                  <span className="user-tag-more">+{request.sender.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sent Tab */}
              {activeTab === 'sent' && (
                <div className="sent-tab">
                  {sentRequests.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📤</span>
                      <h3>No Sent Requests</h3>
                      <p>You haven't sent any connection requests yet</p>
                      <button className="browse-btn" onClick={() => navigate('/browse')}>
                        Search Profiles
                      </button>
                    </div>
                  ) : (
                    <div className="requests-grid">
                      {sentRequests.map((request) => (
                        <div
                          key={request._id}
                          className="request-card"
                          onClick={() => handleViewProfile(request.receiver._id)}
                        >
                          <div className="card-image">
                            {request.receiver.profilePicture ? (
                              <img
                                src={profileImageUrl(request.receiver.profilePicture)}
                                alt={request.receiver.firstName}
                              />
                            ) : (
                              <div className="placeholder-avatar">👤</div>
                            )}
                          </div>
                          <div className="card-info">
                            <h3>{request.receiver.firstName} {request.receiver.lastName}</h3>
                            <p className="card-age">{calculateAge(request.receiver.dateOfBirth)} years old</p>
                            {request.receiver.currentLocation && (
                              <p className="card-location">📍 {request.receiver.currentLocation}</p>
                            )}
                            {request.receiver.tags && request.receiver.tags.length > 0 && (
                              <div className="user-tags-preview">
                                {request.receiver.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="user-tag-mini">{tag}</span>
                                ))}
                                {request.receiver.tags.length > 3 && (
                                  <span className="user-tag-more">+{request.receiver.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                            <div className={`status-badge status-${request.status}`}>
                              {request.status === 'pending' && '⏳ Pending'}
                              {request.status === 'accepted' && '✓ Accepted'}
                              {request.status === 'declined' && '✗ Declined'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Accepted Tab */}
              {activeTab === 'accepted' && (
                <div className="accepted-tab">
                  {acceptedMatches.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">💔</span>
                      <h3>No Matches Yet</h3>
                      <p>You don't have any accepted matches yet</p>
                      <button className="browse-btn" onClick={() => navigate('/browse')}>
                        Search Profiles
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="privacy-notice">
                        <span className="info-icon">🔒</span>
                        <p>Phone numbers are only visible for accepted matches. Connect on WhatsApp to continue your conversation!</p>
                      </div>
                      <div className="requests-grid">
                        {acceptedMatches.map((match) => (
                          <div
                            key={match.connectionId}
                            className="request-card match-card"
                            onClick={() => handleViewProfile(match.user._id)}
                          >
                            <div className="card-image">
                              {match.user.profilePicture ? (
                                <img
                                  src={profileImageUrl(match.user.profilePicture)}
                                  alt={match.user.firstName}
                                />
                              ) : (
                                <div className="placeholder-avatar">👤</div>
                              )}
                            </div>
                            <div className="card-info">
                              <h3>{match.user.firstName} {match.user.lastName}</h3>
                              <p className="card-age">{calculateAge(match.user.dateOfBirth)} years old</p>
                              {match.user.currentLocation && (
                                <p className="card-location">📍 {match.user.currentLocation}</p>
                              )}
                              {match.user.phoneNumber && (
                                <p className="card-phone">📱 {match.user.phoneNumber}</p>
                              )}
                              {match.user.tags && match.user.tags.length > 0 && (
                                <div className="user-tags-preview">
                                  {match.user.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="user-tag-mini">{tag}</span>
                                  ))}
                                  {match.user.tags.length > 3 && (
                                    <span className="user-tag-more">+{match.user.tags.length - 3}</span>
                                  )}
                                </div>
                              )}
                              <div className="match-badge">💕 Matched</div>
                            </div>
                            {match.user.phoneNumber && (
                              <div className="whatsapp-section" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="whatsapp-btn"
                                  onClick={() => openWhatsApp(match.user.phoneNumber)}
                                >
                                  <span className="whatsapp-icon">💬</span>
                                  Chat on WhatsApp
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <button className="modal-close-btn" onClick={() => setShowProfileModal(false)}>✕</button>
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
                  <div className="profile-info-value">{selectedProfile.gender || 'N/A'}</div>
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
                
                {isMatched && selectedProfile.phoneNumber && (
                  <div className="profile-info-item">
                    <div className="profile-info-label">Phone Number</div>
                    <div className="profile-info-value">{selectedProfile.phoneNumber}</div>
                  </div>
                )}
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

              {isMatched && selectedProfile.phoneNumber && (
                <div className="modal-whatsapp-section">
                  <button 
                    className="whatsapp-modal-btn"
                    onClick={() => openWhatsApp(selectedProfile.phoneNumber)}
                  >
                    <span className="whatsapp-icon">💬</span>
                    Continue on WhatsApp
                  </button>
                  <p className="whatsapp-notice">
                    Click to start a conversation on WhatsApp
                  </p>
                </div>
              )}

              {isMatched && !selectedProfile.phoneNumber && (
                <div className="no-phone-notice">
                  <span className="info-icon">ℹ️</span>
                  <p>This user hasn't added their phone number yet</p>
                </div>
              )}
            </div>

            {selectedProfile.requestId && activeTab === 'pending' && (
              <div className="modal-actions">
                <button
                  className="decline-modal-btn"
                  onClick={handleDeclineClick}
                  disabled={saving}
                >
                  {saving ? '...' : '✗ Decline'}
                </button>
                <button
                  className="accept-modal-btn"
                  onClick={handleAcceptRequest}
                  disabled={saving}
                >
                  {saving ? '...' : '✓ Accept'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✨ NEW: Decline Confirmation Modal */}
      {showDeclineConfirm && (
        <div className="decline-confirm-overlay" onClick={handleCancelDecline}>
          <div className="decline-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="decline-confirm-icon">⚠️</div>
            <h3 className="decline-confirm-title">Decline Connection?</h3>
            <p className="decline-confirm-message">
              Are you sure you want to decline this connection request from <strong>{selectedProfile?.firstName}</strong>? 
              This action cannot be undone.
            </p>
            <div className="decline-confirm-actions">
              <button
                className="decline-cancel-btn"
                onClick={handleCancelDecline}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="decline-proceed-btn"
                onClick={handleConfirmDecline}
                disabled={saving}
              >
                {saving ? 'Declining...' : 'Yes, Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchesPage;