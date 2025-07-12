import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrderManagement from './OrderManagement';
import OrderAnalytics from './OrderAnalytics';
import ReturnProcessing from './ReturnProcessing';

/**
 * Order List component that manages all order-related routes
 */
const OrderList = () => {
  return (
    <Routes>
      <Route path="/" element={<OrderManagement />} />
      <Route path="/analytics" element={<OrderAnalytics />} />
      <Route path="/returns" element={<ReturnProcessing />} />
    </Routes>
  );
};

export default OrderList; 