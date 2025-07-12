import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductManagement from './ProductManagement';
import ProductForm from './ProductForm';
import BulkOperations from './BulkOperations';
import PriceOptimization from './PriceOptimization';

/**
 * Product List component that manages all product-related routes
 */
const ProductList = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductManagement />} />
      <Route path="/add" element={<ProductForm isEdit={false} />} />
      <Route path="/edit/:id" element={<ProductForm isEdit={true} />} />
      <Route path="/bulk" element={<BulkOperations />} />
      <Route path="/pricing" element={<PriceOptimization />} />
    </Routes>
  );
};

export default ProductList; 