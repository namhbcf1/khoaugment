import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { 
  UserOutlined, HistoryOutlined,
  LineChartOutlined, SettingOutlined 
} from '@ant-design/icons';
import PersonalProfile from './PersonalProfile';
import CommissionHistory from './CommissionHistory';
import PerformanceHistory from './PerformanceHistory';
import Preferences from './Preferences';

const { TabPane } = Tabs;

/**
 * Staff Profile component for staff members
 */
const StaffProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <Card bordered={false}>
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="large"
        type="card"
      >
        <TabPane 
          tab={<span><UserOutlined /> Hồ sơ cá nhân</span>} 
          key="profile"
        >
          <PersonalProfile />
        </TabPane>
        <TabPane 
          tab={<span><HistoryOutlined /> Lịch sử hoa hồng</span>} 
          key="commissions"
        >
          <CommissionHistory />
        </TabPane>
        <TabPane 
          tab={<span><LineChartOutlined /> Hiệu suất</span>} 
          key="performance"
        >
          <PerformanceHistory />
        </TabPane>
        <TabPane 
          tab={<span><SettingOutlined /> Tùy chỉnh</span>} 
          key="preferences"
        >
          <Preferences />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default StaffProfile; 