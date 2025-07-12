import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, DatePicker, Space, Table, Tag } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const { RangePicker } = DatePicker;

/**
 * MySales component displaying personal sales statistics
 */
const MySales = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    summary: {
      total: 0,
      count: 0,
      averageValue: 0,
      comparedToPrevious: 0
    },
    chartData: [],
    recentSales: []
  });

  // Load sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        
        // Mock data - would be replaced with API call
        setTimeout(() => {
          // Generate last 30 days of data
          const now = new Date();
          const chartData = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 29 + i);
            
            return {
              date: date.toISOString().split('T')[0],
              sales: Math.floor(Math.random() * 5000000) + 1000000,
              transactions: Math.floor(Math.random() * 10) + 1
            };
          });
          
          // Calculate totals
          const totalSales = chartData.reduce((sum, day) => sum + day.sales, 0);
          const totalTransactions = chartData.reduce((sum, day) => sum + day.transactions, 0);
          
          // Generate recent sales
          const recentSales = Array.from({ length: 10 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 7));
            date.setHours(
              Math.floor(Math.random() * 12) + 8,
              Math.floor(Math.random() * 60),
              Math.floor(Math.random() * 60)
            );
            
            return {
              id: `ORD-${1000 + i}`,
              date: date.toISOString(),
              customer: `Khách hàng ${i + 1}`,
              amount: Math.floor(Math.random() * 5000000) + 500000,
              status: ['completed', 'processing', 'completed', 'completed'][Math.floor(Math.random() * 3)]
            };
          }).sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setSalesData({
            summary: {
              total: totalSales,
              count: totalTransactions,
              averageValue: totalSales / totalTransactions,
              comparedToPrevious: Math.floor(Math.random() * 30) - 10
            },
            chartData,
            recentSales
          });
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to fetch sales data:', error);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [user]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  // Table columns
  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'completed' ? 'green' : status === 'processing' ? 'blue' : 'red';
        const text = status === 'completed' ? 'Hoàn thành' : status === 'processing' ? 'Đang xử lý' : 'Đã hủy';
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Space align="center">
          <RangePicker style={{ marginRight: 16 }} />
          <span>Xem doanh số trong khoảng thời gian</span>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng doanh số"
              value={formatCurrency(salesData.summary.total)}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Số giao dịch"
              value={salesData.summary.count}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Giá trị trung bình"
              value={formatCurrency(salesData.summary.averageValue)}
              precision={0}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="So với kỳ trước"
              value={salesData.summary.comparedToPrevious}
              precision={2}
              valueStyle={{
                color: salesData.summary.comparedToPrevious >= 0 ? '#3f8600' : '#cf1322',
              }}
              prefix={salesData.summary.comparedToPrevious >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Biểu đồ doanh số" style={{ marginTop: '16px' }} loading={loading}>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={salesData.chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Doanh số"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Giao dịch gần đây" style={{ marginTop: '16px' }}>
        <Table
          columns={columns}
          dataSource={salesData.recentSales}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </>
  );
};

export default MySales; 