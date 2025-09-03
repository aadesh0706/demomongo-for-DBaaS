import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:5001/api';

const Dashboard = ({ user, token, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and stats in parallel
      const [usersResponse, statsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/stats`)
      ]);

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar">
              {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h1>Welcome, {user.fullName || user.username}!</h1>
              <p>Connected to DBaaS MongoDB</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            All Users
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Database Stats
          </button>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="tab-content"
        >
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="card">
                <h2>Your Profile</h2>
                <div className="profile-details">
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{user.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Username:</label>
                    <span>{user.username}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Account Created:</label>
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>User ID:</label>
                    <span className="user-id">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <div className="card">
                <h2>All Registered Users</h2>
                {error ? (
                  <div className="error-message">{error}</div>
                ) : users.length === 0 ? (
                  <div className="empty-state">
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="users-grid">
                    {users.map((userData, index) => (
                      <motion.div
                        key={userData._id}
                        className="user-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="user-avatar">
                          {userData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-info-card">
                          <h3>{userData.fullName}</h3>
                          <p>@{userData.username}</p>
                          <p className="user-email">{userData.email}</p>
                          <p className="user-date">
                            Joined {new Date(userData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-section">
              <div className="card">
                <h2>Database Statistics</h2>
                {stats ? (
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">{stats.totalUsers}</div>
                      <div className="stat-label">Total Users</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{stats.totalCollections}</div>
                      <div className="stat-label">Collections</div>
                    </div>
                    <div className="stat-card full-width">
                      <h3>Collections</h3>
                      <div className="collections-list">
                        {stats.collections.map((collection, index) => (
                          <div key={index} className="collection-item">
                            <span className="collection-name">{collection.name}</span>
                            <span className="collection-type">{collection.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="stat-card full-width">
                      <div className="connection-info">
                        <h3>Connection Details</h3>
                        <p><strong>Database:</strong> {stats.databaseName}</p>
                        <p><strong>Source:</strong> {stats.connectedFrom}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="loading-stats">
                    <div className="loading-spinner"></div>
                    <p>Loading statistics...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
