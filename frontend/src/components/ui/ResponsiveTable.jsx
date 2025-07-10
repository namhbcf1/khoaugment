import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Typography, Space, Button, Drawer } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import './ResponsiveTable.css';

const { Text, Title } = Typography;

// Mobile Card View Component
const MobileCard = ({ record, columns, actions, onAction }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const renderValue = (column, record) => {
    if (column.render) {
      return column.render(record[column.dataIndex], record);
    }
    return record[column.dataIndex];
  };

  const primaryColumns = columns.filter(col => col.mobile?.primary);
  const secondaryColumns = columns.filter(col => !col.mobile?.primary && !col.mobile?.hidden);

  return (
    <>
      <Card 
        className="mobile-table-card"
        size="small"
        actions={actions && [
          <Button 
            key="more" 
            type="text" 
            icon={<MoreOutlined />}
            onClick={() => setDrawerVisible(true)}
          >
            More
          </Button>
        ]}
      >
        <div className="mobile-card-content">
          {/* Primary Information */}
          <div className="mobile-card-primary">
            {primaryColumns.map(column => (
              <div key={column.key} className="mobile-card-field">
                <Text strong className="mobile-card-value">
                  {renderValue(column, record)}
                </Text>
              </div>
            ))}
          </div>

          {/* Secondary Information */}
          {secondaryColumns.length > 0 && (
            <div className="mobile-card-secondary">
              <Row gutter={[8, 4]}>
                {secondaryColumns.slice(0, 4).map(column => (
                  <Col span={12} key={column.key}>
                    <div className="mobile-card-field">
                      <Text type="secondary" className="mobile-card-label">
                        {column.title}:
                      </Text>
                      <Text className="mobile-card-value">
                        {renderValue(column, record)}
                      </Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="Details"
        placement="bottom"
        height="70%"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        className="mobile-detail-drawer"
      >
        <div className="mobile-detail-content">
          {columns.filter(col => !col.mobile?.hidden).map(column => (
            <div key={column.key} className="mobile-detail-field">
              <Text strong className="mobile-detail-label">
                {column.title}
              </Text>
              <div className="mobile-detail-value">
                {renderValue(column, record)}
              </div>
            </div>
          ))}
          
          {actions && (
            <div className="mobile-detail-actions">
              <Space size="middle">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    type={action.type || 'default'}
                    icon={action.icon}
                    onClick={() => {
                      if (action.onClick) action.onClick(record);
                      if (onAction) onAction(action.key, record);
                      setDrawerVisible(false);
                    }}
                  >
                    {action.label}
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </div>
      </Drawer>
    </>
  );
};

// Responsive Table Component
const ResponsiveTable = ({
  columns = [],
  dataSource = [],
  loading = false,
  pagination = true,
  actions = null,
  onAction = null,
  mobileBreakpoint = 768,
  ...tableProps
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mobileBreakpoint]);

  // Prepare columns for desktop view
  const desktopColumns = [...columns];
  
  // Add actions column if actions are provided
  if (actions && !isMobile) {
    desktopColumns.push({
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {actions.map((action, index) => (
            <Button
              key={index}
              type="text"
              size="small"
              icon={action.icon}
              onClick={() => {
                if (action.onClick) action.onClick(record);
                if (onAction) onAction(action.key, record);
              }}
              title={action.label}
            />
          ))}
        </Space>
      ),
    });
  }

  // Mobile view
  if (isMobile) {
    return (
      <div className="responsive-table-mobile">
        <div className="mobile-table-list">
          {dataSource.map((record, index) => (
            <MobileCard
              key={record.key || index}
              record={record}
              columns={columns}
              actions={actions}
              onAction={onAction}
            />
          ))}
        </div>
        
        {dataSource.length === 0 && !loading && (
          <div className="mobile-empty-state">
            <Text type="secondary">No data available</Text>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="responsive-table-desktop">
      <Table
        columns={desktopColumns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        scroll={{ x: 'max-content' }}
        className="responsive-table"
        {...tableProps}
      />
    </div>
  );
};

// Example usage component
export const ResponsiveTableExample = () => {
  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      mobile: { primary: true },
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      mobile: { primary: true },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <Text type={stock < 10 ? 'danger' : 'success'}>
          {stock} units
        </Text>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₫${price.toLocaleString()}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      mobile: { hidden: true },
      render: (status) => (
        <Text type={status === 'active' ? 'success' : 'secondary'}>
          {status}
        </Text>
      ),
    },
  ];

  const dataSource = [
    {
      key: '1',
      name: 'Coca Cola 330ml',
      sku: 'CC-330-001',
      category: 'Beverages',
      stock: 150,
      price: 12000,
      status: 'active',
    },
    {
      key: '2',
      name: 'Bánh mì sandwich',
      sku: 'BM-SW-001',
      category: 'Food',
      stock: 25,
      price: 25000,
      status: 'active',
    },
    {
      key: '3',
      name: 'Mì tôm Hảo Hảo',
      sku: 'MT-HH-001',
      category: 'Food',
      stock: 5,
      price: 5000,
      status: 'low_stock',
    },
  ];

  const actions = [
    {
      key: 'view',
      label: 'View',
      icon: <EyeOutlined />,
      onClick: (record) => console.log('View:', record),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: (record) => console.log('Edit:', record),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      type: 'text',
      onClick: (record) => console.log('Delete:', record),
    },
  ];

  return (
    <div>
      <Title level={3}>Responsive Table Example</Title>
      <ResponsiveTable
        columns={columns}
        dataSource={dataSource}
        actions={actions}
        onAction={(actionKey, record) => {
          console.log(`Action ${actionKey} on:`, record);
        }}
      />
    </div>
  );
};

export default ResponsiveTable;
