import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ReportCenter from './ReportCenter';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import BusinessIntelligence from './BusinessIntelligence';
import CustomReports from './CustomReports';
import OmnichannelAnalytics from './OmnichannelAnalytics';

/**
 * Reports Dashboard component that manages all reports routes
 */
const ReportsDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<ReportCenter />} />
      <Route path="/sales" element={<SalesReport />} />
      <Route path="/inventory" element={<InventoryReport />} />
      <Route path="/business-intelligence" element={<BusinessIntelligence />} />
      <Route path="/custom" element={<CustomReports />} />
      <Route path="/omnichannel" element={<OmnichannelAnalytics />} />
    </Routes>
  );
};

export default ReportsDashboard; 