import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsScreen = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleResetSettings = () => {
    setDarkMode(false);
    setNotifications(false);
    setEmailNotifications(false);
    setShowResetDialog(false);
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <button onClick={() => navigate(-1)}>← Back</button>
        <h2>Settings</h2>
      </header>

      <div className="settings-section">
        <h3>Appearance</h3>
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          Dark Mode
        </label>
      </div>

      <div className="settings-section">
        <h3>Notifications</h3>
        <label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
          Push Notifications
        </label>
        <label>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
          />
          Email Notifications
        </label>
      </div>

      <div className="settings-section">
        <h3>Account</h3>
        <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
        <button disabled>Change Password (Coming Soon)</button>
      </div>

      <div className="settings-section">
        <h3>More</h3>
        <button onClick={() => setShowResetDialog(true)}>Reset Settings</button>
        <button onClick={handleLogout} style={{ color: 'red' }}>Log Out</button>
      </div>

      {showResetDialog && (
        <div className="dialog-backdrop">
          <div className="dialog">
            <p>Reset all settings to default?</p>
            <button onClick={handleResetSettings}>Yes, Reset</button>
            <button onClick={() => setShowResetDialog(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
