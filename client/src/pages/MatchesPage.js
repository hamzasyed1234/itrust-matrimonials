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

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Fetch all connection data
  useEffect(() => {
    const fetchConnectionData = async () => {
      setLoadingData(true);
      try {
        // Fetch pending requests (received)
        const pendingResponse = await api.get('/connections/pending');
        if (pendingResponse.data.success) {
          setPendingRequests(pendingResponse.data.requests);
        }

        // Fetch sent requests
        const sentResponse = await api.get('/connections/sent');
        if (sentResponse.data.success) {
          setSentRequests(sentResponse.data.requests);
        }

        // Fetch accepted matches
        const matchesResponse = await api.get('/connections/my-connections');
        if (matchesResponse.data.success) {
          setAcceptedMatches(matchesResponse.data.connections);
        }
      } catch (error) {
        console.error('Error fetching connection data:', error);
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

  // View profile
  const handleViewProfile = async (userId, requestId = null) => {
    try {
      const response = await api.get(`/browse/profile/${userId}`);
      if (response.data.success) {
        setSelectedProfile({ ...response.data.profile, requestId });
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Could not load profile');
    }
  };

  // Accept connection request
  const handleAcceptRequest = async () => {
    if (!selectedProfile || !selectedProfile.requestId) return;

    setSaving(true);
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
        alert('Connection accepted! 🎉');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert(error.response?.data?.message || 'Failed to accept connection');
    } finally {
      setSaving(false);
    }
  };

  // Decline connection request
  const handleDeclineRequest = async () => {
    if (!selectedProfile || !selectedProfile.requestId) return;

    setSaving(true);
    try {
      const response = await api.put(`/connections/decline/${selectedProfile.requestId}`);
      if (response.data.success) {
        // Remove from pending
        setPendingRequests(prev => prev.filter(req => req._id !== selectedProfile.requestId));
        setShowProfileModal(false);
        setSelectedProfile(null);
        alert('Connection declined');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline connection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="matches-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="matches-page">
      <Navbar onLogout={handleLogout} activeTab="matches" />

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
            Pending
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
            <span className="tab-badge">{acceptedMatches.length}/3</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {loadingData ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading...</p>
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
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${request.sender.profilePicture}`}
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
                          </div>
                          <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="decline-btn-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(request.sender._id, request._id);
                              }}
                            >
                              ✗
                            </button>
                            <button
                              className="accept-btn-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(request.sender._id, request._id);
                              }}
                            >
                              ✓
                            </button>
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
                        Browse Profiles
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
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${request.receiver.profilePicture}`}
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
                        Browse Profiles
                      </button>
                    </div>
                  ) : (
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
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${match.user.profilePicture}`}
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
                            <div className="match-badge">💕 Matched</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowProfileModal(false)}>✕</button>

            <div className="modal-profile-header">
              <div className="modal-profile-picture">
                {selectedProfile.profilePicture ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${selectedProfile.profilePicture}`}
                    alt={selectedProfile.firstName}
                  />
                ) : (
                  <div className="placeholder">👤</div>
                )}
              </div>
              <h2>{selectedProfile.firstName} {selectedProfile.lastName}</h2>
              <p className="profile-age">{calculateAge(selectedProfile.dateOfBirth)} years old</p>
            </div>

            <div className="modal-profile-info">
              <div className="info-grid">
                {selectedProfile.ethnicity && (
                  <div className="info-item">
                    <span className="label">🌍 Ethnicity</span>
                    <span className="value">{selectedProfile.ethnicity}</span>
                  </div>
                )}
                {selectedProfile.height && (
                  <div className="info-item">
                    <span className="label">📏 Height</span>
                    <span className="value">{selectedProfile.height}</span>
                  </div>
                )}
                {selectedProfile.currentLocation && (
                  <div className="info-item">
                    <span className="label">📍 Location</span>
                    <span className="value">{selectedProfile.currentLocation}</span>
                  </div>
                )}
                {selectedProfile.profession && (
                  <div className="info-item">
                    <span className="label">💼 Profession</span>
                    <span className="value">{selectedProfile.profession}</span>
                  </div>
                )}
                {selectedProfile.education && (
                  <div className="info-item">
                    <span className="label">🎓 Education</span>
                    <span className="value">{selectedProfile.education}</span>
                  </div>
                )}
                {selectedProfile.maritalStatus && (
                  <div className="info-item">
                    <span className="label">💍 Marital Status</span>
                    <span className="value">{selectedProfile.maritalStatus}</span>
                  </div>
                )}
                {selectedProfile.languages && selectedProfile.languages.length > 0 && (
                  <div className="info-item full-width">
                    <span className="label">🗣️ Languages</span>
                    <span className="value">{selectedProfile.languages.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Show accept/decline buttons only if viewing from pending tab */}
            {selectedProfile.requestId && activeTab === 'pending' && (
              <div className="modal-actions">
                <button
                  className="decline-modal-btn"
                  onClick={handleDeclineRequest}
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
    </div>
  );
}

export default MatchesPage;
