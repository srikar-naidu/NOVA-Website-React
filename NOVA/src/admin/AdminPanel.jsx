import React, { useState, useEffect } from 'react';
import ProjectUpload from './ProjectUpload';

const AdminPanel = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateDay: '',
    dateMonth: '',
    location: '',
    time: '',
    registrationLink: '',
    icon: 'fas fa-bullhorn'
  });

  // Check if already authenticated
  useEffect(() => {
    const authenticated = localStorage.getItem('adminAuth');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      loadAnnouncements();
    }
  }, []);

  const authenticate = async () => {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuth', 'true');
        loadAnnouncements();
      } else {
        alert('Incorrect password');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Authentication failed');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  // Load announcements
  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      setAnnouncements([]);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new announcement
  const addAnnouncement = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.description) {
        alert('Title and description are required!');
        return;
      }

      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Announcement added successfully!');
        setShowForm(false);
        resetForm();
        loadAnnouncements();
      } else {
        const errorData = await response.json();
        alert('Error adding announcement: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding announcement:', error);
      alert('Error adding announcement');
    }
  };

  // Delete announcement
  const deleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        const response = await fetch(`/api/announcements/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          alert('Announcement deleted!');
          loadAnnouncements();
        } else {
          alert('Error deleting announcement');
        }
      } catch (error) {
        console.error('Error deleting announcement:', error);
        alert('Error deleting announcement');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dateDay: '',
      dateMonth: '',
      location: '',
      time: '',
      registrationLink: '',
      icon: 'fas fa-bullhorn'
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '100px auto', 
        padding: '2rem', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Admin Login</h2>
        <input 
          type="password" 
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && authenticate()}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
        <button 
          onClick={authenticate}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#8a2be2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
        borderRadius: '8px'
      }}>
        <h1 style={{ margin: 0 }}>NOVA Admin Panel</h1>
        <div>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{
              marginRight: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#4169e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showForm ? 'Cancel' : 'Add Announcement'}
          </button>
          <button 
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add Announcement Form */}
      {showForm && (
        <div style={{
          backgroundColor: 'rgba(30, 30, 30, 0.9)',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '2rem'
        }}>
          <h3>Add New Announcement</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Title: <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., NOVA Inaugural Event"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Description: <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Join us for the launch event..."
              rows="3"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Date (Day):</label>
              <input
                type="text"
                name="dateDay"
                value={formData.dateDay}
                onChange={handleInputChange}
                placeholder="e.g., 25th"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Date (Month):</label>
              <input
                type="text"
                name="dateMonth"
                value={formData.dateMonth}
                onChange={handleInputChange}
                placeholder="e.g., JUNE"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Virtual Meeting"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Time:</label>
              <input
                type="text"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                placeholder="e.g., 7:00 PM - 9:00 PM"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Registration Link:</label>
            <input
              type="url"
              name="registrationLink"
              value={formData.registrationLink}
              onChange={handleInputChange}
              placeholder="https://forms.google.com/..."
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Icon (FontAwesome class):</label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              placeholder="e.g., fas fa-calendar-alt"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
            <small style={{ color: '#999' }}>
              Common icons: fas fa-calendar-alt, fas fa-users, fas fa-trophy, fas fa-rocket, fas fa-bullhorn
            </small>
          </div>

          <button 
            onClick={addAnnouncement}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Add Announcement
          </button>
          <button 
            onClick={() => { setShowForm(false); resetForm(); }}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Existing Announcements */}
      <div>
        <h3>Existing Announcements ({announcements.length})</h3>
        {announcements.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
            No announcements yet. Click "Add Announcement" to create one.
          </p>
        ) : (
          announcements.map(announcement => (
            <div 
              key={announcement.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem',
                backgroundColor: 'rgba(30, 30, 30, 0.9)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <i className={announcement.icon} style={{ marginRight: '0.5rem', color: '#8a2be2' }}></i>
                    <h4 style={{ margin: 0 }}>{announcement.title}</h4>
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#ccc' }}>{announcement.description}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <p style={{ margin: 0, color: '#aaa' }}>
                      <strong>📅 Date:</strong> {announcement.date?.day || 'N/A'} {announcement.date?.month || ''}
                    </p>
                    <p style={{ margin: 0, color: '#aaa' }}>
                      <strong>📍 Location:</strong> {announcement.details?.location || 'N/A'}
                    </p>
                    <p style={{ margin: 0, color: '#aaa' }}>
                      <strong>🕐 Time:</strong> {announcement.details?.time || 'N/A'}
                    </p>
                    <p style={{ margin: 0, color: '#aaa' }}>
                      <strong>Status:</strong> <span style={{ color: announcement.isActive ? '#28a745' : '#dc3545' }}>
                        {announcement.isActive ? 'Active ✓' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  
                  {announcement.registrationLink && (
                    <p style={{ margin: '0.5rem 0 0 0' }}>
                      <strong>🔗 Link:</strong>{' '}
                      <a 
                        href={announcement.registrationLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#4169e1', textDecoration: 'none' }}
                      >
                        {announcement.registrationLink}
                      </a>
                    </p>
                  )}
                </div>
                <div>
                  <button 
                    onClick={() => deleteAnnouncement(announcement.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Upload Section - Always available to admins at bottom or in a new tab if you prefer, but putting it at the bottom for now */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <ProjectUpload />
      </div>
    </div>
  );
};

export default AdminPanel;