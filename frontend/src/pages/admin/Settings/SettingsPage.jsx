import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SystemSettings from './SystemSettings';
import CompanyProfile from './CompanyProfile';
import SecuritySettings from './SecuritySettings';
import UserRoles from './UserRoles';
import HardwareManager from './HardwareManager';

/**
 * Settings Page component that manages all settings routes
 */
const SettingsPage = () => {
  return (
    <Routes>
      <Route path="/" element={<SystemSettings />} />
      <Route path="/company" element={<CompanyProfile />} />
      <Route path="/security" element={<SecuritySettings />} />
      <Route path="/users" element={<UserRoles />} />
      <Route path="/hardware" element={<HardwareManager />} />
    </Routes>
  );
};

export default SettingsPage; 