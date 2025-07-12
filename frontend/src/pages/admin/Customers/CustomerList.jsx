import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerManagement from './CustomerManagement';
import CustomerAnalytics from './CustomerAnalytics';
import CustomerSegmentation from './CustomerSegmentation';
import LoyaltyPrograms from './LoyaltyPrograms';
import PersonalizationEngine from './PersonalizationEngine';

/**
 * Customer List component that manages all customer-related routes
 */
const CustomerList = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomerManagement />} />
      <Route path="/analytics" element={<CustomerAnalytics />} />
      <Route path="/segmentation" element={<CustomerSegmentation />} />
      <Route path="/loyalty" element={<LoyaltyPrograms />} />
      <Route path="/personalization" element={<PersonalizationEngine />} />
    </Routes>
  );
};

export default CustomerList; 