import { ArrowDownOutlined, ArrowUpOutlined, RiseOutlined, ShoppingCartOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Card, Col, Row, Spin, Statistic, Table, Typography } from 'antd';
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { DashboardStats, TopProduct, analyticsAPI } from '../../services/api';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Title: TitleComponent } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch dashboard stats
        const dashboardStats = await analyticsAPI.getDashboardStats();
        setStats(dashboardStats);
        
        // Fetch sales chart data
        const salesChartData = await analyticsAPI.getSalesChart('month');
        setSalesData(salesChartData);
        
        // Fetch top products
        const topProductsData = await analyticsAPI.getTopProducts(5);
        setTopProducts(topProductsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format currency function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  // Prepare chart data
  const chartData = {
    labels: salesData.map(item => item.date),
    datasets: [
      {
        label: 'Doanh thu',
        data: salesData.map(item => item.revenue),
        borderColor: '#1890ff',
        backgroundColor: 'rgba(24, 144, 255, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Đơn hàng',
        data: salesData.map(item => item.orders),
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.5)',
        tension: 0.4,
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.label === 'Doanh thu') {
              return label + formatCurrency(context.raw);
            }
            return label + context.raw;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(0) + 'M';
            }
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K';
            }
            return value;
          }
        }
      }
    }
  };
  
  // Top products columns
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số lượng đã bán',
      dataIndex: 'total_sold',
      key: 'total_sold',
      render: (value: number) => value.toLocaleString('vi-VN'),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value: number) => formatCurrency(value),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <TitleComponent level={2}>Tổng quan</TitleComponent>
      
      {/* Stats cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng này"
              value={stats?.totalRevenue || 0}
              precision={0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<RiseOutlined />}
              suffix="₫"
              formatter={(value) => `${value.toLocaleString('vi-VN')}`}
            />
            <div style={{ marginTop: 8 }}>
              {stats && stats.revenueGrowth > 0 ? (
                <span style={{ color: '#52c41a' }}>
                  <ArrowUpOutlined /> {stats.revenueGrowth.toFixed(1)}% so với tháng trước
                </span>
              ) : (
                <span style={{ color: '#ff4d4f' }}>
                  <ArrowDownOutlined /> {Math.abs(stats?.revenueGrowth || 0).toFixed(1)}% so với tháng trước
                </span>
              )}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn hàng"
              value={stats?.totalOrders || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ShoppingCartOutlined />}
              formatter={(value) => `${value.toLocaleString('vi-VN')}`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sản phẩm"
              value={stats?.totalProducts || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ShoppingOutlined />}
              formatter={(value) => `${value.toLocaleString('vi-VN')}`}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng"
              value={stats?.totalCustomers || 0}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
              formatter={(value) => `${value.toLocaleString('vi-VN')}`}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Sales chart */}
      <Card title="Biểu đồ doanh thu" style={{ marginBottom: 24 }}>
        <div style={{ height: 300 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </Card>
      
      {/* Top products */}
      <Card title="Sản phẩm bán chạy">
        <Table 
          columns={columns} 
          dataSource={topProducts}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 