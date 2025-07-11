/**
 * Product Grid Component
 * Interactive product selection grid for POS and inventory management
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Badge, 
  Image, 
  Tooltip, 
  Space,
  Tag,
  Empty,
  Spin,
  message,
  Pagination
} from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  HeartOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';
import { productAPI } from '../../../services/api/productService.js';
import { formatCurrency } from '../../../utils/helpers/formatHelpers.js';
import errorHandler from '../../../utils/helpers/errorHandler.js';
import './ProductGrid.css';

const { Search } = Input;
const { Option } = Select;

/**
 * ProductGrid Component
 * @param {Object} props - Component props
 * @param {Array} props.products - Product data array
 * @param {Function} props.onProductSelect - Product selection callback
 * @param {Function} props.onAddToCart - Add to cart callback
 * @param {boolean} props.loading - Loading state
 * @param {string} props.viewMode - Grid view mode (grid, list)
 * @param {boolean} props.showFilters - Show filter controls
 * @param {boolean} props.showSearch - Show search functionality
 * @param {Object} props.cartItems - Current cart items
 * @param {Array} props.categories - Available categories
 * @param {boolean} props.selectable - Enable product selection
 * @returns {JSX.Element} Product grid component
 */
const ProductGrid = ({
  products = [],
  onProductSelect,
  onAddToCart,
  loading = false,
  viewMode = 'grid',
  showFilters = true,
  showSearch = true,
  cartItems = {},
  categories = [],
  selectable = true,
  pageSize = 12,
  className = ''
}) => {
  const { hasPermission } = useAuth();
  
  // State management
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchText) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.categoryId === selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [products, searchText, selectedCategory, sortBy, sortOrder]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  // Handle search
  const handleSearch = useCallback((value) => {
    setSearchText(value);
    setCurrentPage(1);
  }, []);

  // Handle category filter
  const handleCategoryChange = useCallback((value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((value) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order);
  }, []);

  // Handle product selection
  const handleProductClick = useCallback((product) => {
    if (selectable && onProductSelect) {
      onProductSelect(product);
    }
  }, [selectable, onProductSelect]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (product, event) => {
    event?.stopPropagation();
    
    try {
      if (onAddToCart) {
        await onAddToCart(product);
        message.success(`Đã thêm ${product.name} vào giỏ hàng`);
      }
    } catch (error) {
      errorHandler.handle(error, { 
        component: 'ProductGrid',
        action: 'addToCart',
        productId: product.id 
      });
    }
  }, [onAddToCart]);

  // Handle product selection for bulk operations
  const handleProductSelection = useCallback((product, selected) => {
    const newSelected = new Set(selectedProducts);
    if (selected) {
      newSelected.add(product.id);
    } else {
      newSelected.delete(product.id);
    }
    setSelectedProducts(newSelected);
  }, [selectedProducts]);

  // Get stock status
  const getStockStatus = useCallback((product) => {
    const stock = product.stock || 0;
    if (stock === 0) return { status: 'error', text: 'Hết hàng' };
    if (stock < 10) return { status: 'warning', text: 'Sắp hết' };
    return { status: 'success', text: 'Còn hàng' };
  }, []);

  // Render product card
  const renderProductCard = useCallback((product) => {
    const stockStatus = getStockStatus(product);
    const inCart = cartItems[product.id] || 0;
    const isSelected = selectedProducts.has(product.id);

    return (
      <Card
        key={product.id}
        className={`product-card ${isSelected ? 'selected' : ''} ${currentViewMode}`}
        hoverable
        onClick={() => handleProductClick(product)}
        cover={
          <div className="product-image-container">
            <Image
              alt={product.name}
              src={product.image || '/assets/images/product-placeholder.png'}
              preview={false}
              className="product-image"
            />
            {inCart > 0 && (
              <Badge
                count={inCart}
                className="cart-badge"
                style={{ backgroundColor: '#52c41a' }}
              />
            )}
            <div className="product-overlay">
              <Space>
                <Tooltip title="Xem chi tiết">
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<EyeOutlined />}
                    size="small"
                  />
                </Tooltip>
                {hasPermission('products.addToCart') && (
                  <Tooltip title="Thêm vào giỏ">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<ShoppingCartOutlined />}
                      size="small"
                      onClick={(e) => handleAddToCart(product, e)}
                    />
                  </Tooltip>
                )}
              </Space>
            </div>
          </div>
        }
        actions={currentViewMode === 'grid' ? [
          <Tooltip title="Thêm vào giỏ" key="cart">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={(e) => handleAddToCart(product, e)}
              disabled={stockStatus.status === 'error'}
            >
              Thêm
            </Button>
          </Tooltip>
        ] : undefined}
      >
        <Card.Meta
          title={
            <div className="product-title">
              <Tooltip title={product.name}>
                <span className="product-name">{product.name}</span>
              </Tooltip>
              <Tag color={stockStatus.status} className="stock-tag">
                {stockStatus.text}
              </Tag>
            </div>
          }
          description={
            <div className="product-details">
              <div className="product-sku">SKU: {product.sku}</div>
              <div className="product-price">
                {formatCurrency(product.price)}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="product-original-price">
                  <del>{formatCurrency(product.originalPrice)}</del>
                </div>
              )}
              <div className="product-stock">
                Tồn kho: {product.stock || 0}
              </div>
            </div>
          }
        />
      </Card>
    );
  }, [
    currentViewMode,
    cartItems,
    selectedProducts,
    hasPermission,
    handleProductClick,
    handleAddToCart,
    getStockStatus
  ]);

  return (
    <div className={`product-grid-container ${className}`}>
      {/* Filters and Controls */}
      {(showFilters || showSearch) && (
        <Card className="product-controls" size="small">
          <Row gutter={[16, 16]} align="middle">
            {showSearch && (
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Tìm kiếm sản phẩm..."
                  allowClear
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </Col>
            )}
            
            {showFilters && (
              <>
                <Col xs={12} sm={6} md={4}>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    style={{ width: '100%' }}
                    placeholder="Danh mục"
                  >
                    <Option value="all">Tất cả</Option>
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                
                <Col xs={12} sm={6} md={4}>
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={handleSortChange}
                    style={{ width: '100%' }}
                    placeholder="Sắp xếp"
                  >
                    <Option value="name-asc">Tên A-Z</Option>
                    <Option value="name-desc">Tên Z-A</Option>
                    <Option value="price-asc">Giá thấp đến cao</Option>
                    <Option value="price-desc">Giá cao đến thấp</Option>
                    <Option value="stock-desc">Tồn kho nhiều</Option>
                    <Option value="createdAt-desc">Mới nhất</Option>
                  </Select>
                </Col>
              </>
            )}
            
            <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
              <Space>
                <Button.Group>
                  <Button
                    type={currentViewMode === 'grid' ? 'primary' : 'default'}
                    icon={<AppstoreOutlined />}
                    onClick={() => setCurrentViewMode('grid')}
                  />
                  <Button
                    type={currentViewMode === 'list' ? 'primary' : 'default'}
                    icon={<BarsOutlined />}
                    onClick={() => setCurrentViewMode('list')}
                  />
                </Button.Group>
                
                <span className="product-count">
                  {filteredProducts.length} sản phẩm
                </span>
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      {/* Product Grid */}
      <Spin spinning={loading}>
        {paginatedProducts.length > 0 ? (
          <>
            <Row gutter={[16, 16]} className="product-grid">
              {paginatedProducts.map(product => (
                <Col
                  key={product.id}
                  xs={currentViewMode === 'list' ? 24 : 12}
                  sm={currentViewMode === 'list' ? 24 : 12}
                  md={currentViewMode === 'list' ? 24 : 8}
                  lg={currentViewMode === 'list' ? 24 : 6}
                  xl={currentViewMode === 'list' ? 24 : 4}
                >
                  {renderProductCard(product)}
                </Col>
              ))}
            </Row>
            
            {/* Pagination */}
            {filteredProducts.length > pageSize && (
              <div className="product-pagination">
                <Pagination
                  current={currentPage}
                  total={filteredProducts.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => 
                    `${range[0]}-${range[1]} của ${total} sản phẩm`
                  }
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            description="Không tìm thấy sản phẩm nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Spin>
    </div>
  );
};

export default ProductGrid;
