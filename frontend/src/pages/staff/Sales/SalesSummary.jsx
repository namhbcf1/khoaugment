import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { 
  LineChartOutlined, UserOutlined, 
  TagsOutlined, TrophyOutlined 
} from '@ant-design/icons';
import MySales from './MySales';
import CustomerInsights from './CustomerInsights';
import ProductRecommendations from './ProductRecommendations';
import SalesTargets from './SalesTargets';

const { TabPane } = Tabs;

/**
 * Sales Summary component for staff members
 */
const SalesSummary = () => {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <Card bordered={false}>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="large"
        type="card"
      >
        <TabPane 
          tab={<span><LineChartOutlined /> Doanh số của tôi</span>} 
          key="sales"
        >
          <MySales />
        </TabPane>
        <TabPane 
          tab={<span><UserOutlined /> Khách hàng</span>} 
          key="customers"
        >
          <CustomerInsights />
        </TabPane>
        <TabPane 
          tab={<span><TagsOutlined /> Đề xuất sản phẩm</span>} 
          key="recommendations"
        >
          <ProductRecommendations />
        </TabPane>
        <TabPane 
          tab={<span><TrophyOutlined /> Mục tiêu</span>} 
          key="targets"
        >
          <SalesTargets />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default SalesSummary; 