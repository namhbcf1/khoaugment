import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffManagement from './StaffManagement';
import PerformanceTracking from './PerformanceTracking';
import CommissionSettings from './CommissionSettings';
import GamificationConfig from './GamificationConfig';

/**
 * Staff List component that manages all staff-related routes
 */
const StaffList = () => {
  return (
    <Routes>
      <Route path="/" element={<StaffManagement />} />
      <Route path="/performance" element={<PerformanceTracking />} />
      <Route path="/commissions" element={<CommissionSettings />} />
      <Route path="/gamification" element={<GamificationConfig />} />
    </Routes>
  );
};

export default StaffList; 