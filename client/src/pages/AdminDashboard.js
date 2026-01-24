import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    gender: 'all',
    minAge: '',
    maxAge: '',
    profileCompleted: 'all',
    search: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await api.get('/admin/statistics');
        if (response.data.success) {
          setStatistics(response.data.statistics);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    if (user && user.isAdmin) {
      fetchStatistics();
    }
  }, [user]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !user.isAdmin) return;

      setLoadingUsers(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit
        };

        if (filters.gender !== 'all') params.gender = filters.gender;
        if (filters.minAge) params.minAge = filters.minAge;
        if (filters.maxAge) params.maxAge = filters.maxAge;
        if (filters.profileCompleted !== 'all') params.profileCompleted = filters.profileCompleted;
        if (filters.search) params.search = filters.search;

        const response = await api.get('/admin/users', { params });
        
        if (response.data.success) {
          setUsers(response.data.users);
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total,
            pages: response.data.pagination.pages
          }));
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user, filters, pagination.page, pagination.limit]);

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

  const openUserModal = (userProfile) => {
    setSelectedUser(userProfile);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const clearFilters = () => {
    setFilters({
      gender: 'all',
      minAge: '',
      maxAge: '',
      profileCompleted: 'all',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const profileImageUrl = (picturePath) => {
    if (!picturePath) return null;
    if (picturePath.startsWith('http')) return picturePath;
    if (picturePath.startsWith('/avatars/')) return picturePath;
    return `/avatars/${picturePath}`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <Navbar onLogout={handleLogout} activeTab="admin" />

      <div className="admin-content">
        <div className="admin-header">
          <h1>👨‍💼 Admin Dashboard</h1>
          <p className="admin-subtitle">Manage all user profiles and view statistics</p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="stats-cards">
            <div className="stat-card total">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{statistics.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card male">
              <div className="stat-icon">👨</div>
              <div className="stat-info">
                <h3>{statistics.maleUsers}</h3>
                <p>Male Users</p>
              </div>
            </div>
            <div className="stat-card female">
              <div className="stat-icon">👩</div>
              <div className="stat-info">
                <h3>{statistics.femaleUsers}</h3>
                <p>Female Users</p>
              </div>
            </div>
            <div className="stat-card complete">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{statistics.completedProfiles}</h3>
                <p>Completed Profiles</p>
              </div>
            </div>
            <div className="stat-card incomplete">
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>{statistics.incompleteProfiles}</h3>
                <p>Incomplete Profiles</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="admin-filters">
          <h2>Filters</h2>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Name or email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <div className="filter-group">
              <label>Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Age</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minAge}
                onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
              />
            </div>

            <div className="filter-group">
              <label>Max Age</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAge}
                onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
              />
            </div>

            <div className="filter-group">
              <label>Profile Status</label>
              <select
                value={filters.profileCompleted}
                onChange={(e) => setFilters(prev => ({ ...prev, profileCompleted: e.target.value }))}
              >
                <option value="all">All Profiles</option>
                <option value="true">Completed</option>
                <option value="false">Incomplete</option>
              </select>
            </div>

            <div className="filter-group">
              <button className="clear-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-section">
          <div className="users-header">
            <h2>All Users</h2>
            <p className="users-count">
              Showing {users.length} of {pagination.total} users
            </p>
          </div>

          {loadingUsers ? (
            <div className="loading-users">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length > 0 ? (
            <>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Location</th>
                      <th>Profile</th>
                      <th>Matches</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userProfile) => (
                      <tr key={userProfile._id}>
                        <td>
                          <div className="table-avatar">
                            {userProfile.profilePicture ? (
                              <img src={profileImageUrl(userProfile.profilePicture)} alt={userProfile.firstName} />
                            ) : (
                              <div className="avatar-placeholder">👤</div>
                            )}
                          </div>
                        </td>
                        <td className="name-cell">
                          {userProfile.firstName} {userProfile.lastName}
                        </td>
                        <td className="email-cell">{userProfile.email}</td>
                        <td>
                          <span className={`gender-badge ${userProfile.gender}`}>
                            {userProfile.gender === 'male' ? '👨' : '👩'} {userProfile.gender}
                          </span>
                        </td>
                        <td>{calculateAge(userProfile.dateOfBirth)}</td>
                        <td className="location-cell">{userProfile.currentLocation || 'Not set'}</td>
                        <td>
                          <span className={`status-badge ${userProfile.profileCompleted ? 'complete' : 'incomplete'}`}>
                            {userProfile.profileCompleted ? '✅ Complete' : '⚠️ Incomplete'}
                          </span>
                        </td>
                        <td className="matches-cell">{userProfile.matchCount || 0}</td>
                        <td>
                          <button
                            className="view-btn"
                            onClick={() => openUserModal(userProfile)}
                          >
                            👁️ View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    ← Previous
                  </button>
                  <span className="page-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-users">
              <p>No users found matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeUserModal}>✕</button>

            <div className="modal-header">
              <div className="modal-avatar">
                {selectedUser.profilePicture ? (
                  <img src={profileImageUrl(selectedUser.profilePicture)} alt={selectedUser.firstName} />
                ) : (
                  <div className="avatar-placeholder-large">👤</div>
                )}
              </div>
              <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
              <p className="user-email">{selectedUser.email}</p>
            </div>

            {selectedUser.tags && selectedUser.tags.length > 0 && (
              <div className="modal-tags">
                <h3>Tags</h3>
                <div className="tags-container">
                  {selectedUser.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-details">
              <div className="detail-row">
                <span className="detail-label">Gender:</span>
                <span className="detail-value">{selectedUser.gender}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{calculateAge(selectedUser.dateOfBirth)} years</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ethnicity:</span>
                <span className="detail-value">{selectedUser.ethnicity || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Height:</span>
                <span className="detail-value">{selectedUser.height || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Marital Status:</span>
                <span className="detail-value">{selectedUser.maritalStatus || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Birth Place:</span>
                <span className="detail-value">{selectedUser.birthPlace || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Current Location:</span>
                <span className="detail-value">{selectedUser.currentLocation || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Residency Status:</span>
                <span className="detail-value">{selectedUser.residencyStatus || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Profession:</span>
                <span className="detail-value">{selectedUser.profession || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Education:</span>
                <span className="detail-value">{selectedUser.education || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Languages:</span>
                <span className="detail-value">
                  {selectedUser.languages && selectedUser.languages.length > 0
                    ? selectedUser.languages.join(', ')
                    : 'Not set'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedUser.phoneNumber || 'Not set'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Matches:</span>
                <span className="detail-value">{selectedUser.matchCount || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Profile Status:</span>
                <span className="detail-value">
                  {selectedUser.profileCompleted ? '✅ Complete' : '⚠️ Incomplete'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Joined:</span>
                <span className="detail-value">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {selectedUser.customFields && Object.keys(selectedUser.customFields).length > 0 && (
              <div className="modal-custom-fields">
                <h3>Additional Information</h3>
                {Object.entries(selectedUser.customFields).map(([key, value]) => (
                  <div key={key} className="detail-row">
                    <span className="detail-label">{key}:</span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;