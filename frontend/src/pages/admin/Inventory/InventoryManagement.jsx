import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InventoryDashboard from './InventoryDashboard';
import StockMovements from './StockMovements';
import DemandForecasting from './DemandForecasting';
import WarehouseManagement from './WarehouseManagement';

/**
 * Inventory Management component that manages all inventory-related routes
 */
const InventoryManagement = () => {
  return (
    <Routes>
      <Route path="/" element={<InventoryDashboard />} />
      <Route path="/movements" element={<StockMovements />} />
      <Route path="/forecasting" element={<DemandForecasting />} />
      <Route path="/warehouses" element={<WarehouseManagement />} />
    </Routes>
  );
};

export default InventoryManagement; 