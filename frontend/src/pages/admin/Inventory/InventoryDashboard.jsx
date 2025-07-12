import {
  BarChartOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  LineChartOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StockAdjustmentModal from "../../../components/Inventory/StockAdjustmentModal";
import { inventoryAPI } from "../../../services/api.ts";
import { formatCurrency } from "../../../utils/helpers/formatters";

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Inventory Dashboard component displaying real-time stock levels and alerts
 */
const InventoryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    low_stock: 0,
    out_of_stock: 0,
    total_value: 0,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    category_id: undefined,
    low_stock: false,
  });
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch inventory data
  const fetchInventory = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getInventory({
        ...filters,
        page,
        limit: pageSize,
      });

      setProducts(response.products);
      setSummary(response.summary);
      setPagination({
        current: page,
        pageSize,
        total: response.pagination.total,
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      // This would normally come from a categories API
      // Using a placeholder for now
      const categoriesData = [
        { id: 1, name: "Electronics" },
        { id: 2, name: "Clothing" },
        { id: 3, name: "Food & Beverages" },
        { id: 4, name: "Office Supplies" },
      ];
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const alertsData = await inventoryAPI.getAlerts();
      setAlerts(alertsData.low_stock.slice(0, 5));
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchAlerts();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchInventory(1, pagination.pageSize);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      category_id: undefined,
      low_stock: false,
    });
    fetchInventory(1, pagination.pageSize);
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (pagination) => {
    fetchInventory(pagination.current, pagination.pageSize);
  };

  // Handle stock adjustment
  const handleStockAdjustment = (product) => {
    setSelectedProduct(product);
    setAdjustmentModalVisible(true);
  };

  // Stock adjustment submission
  const handleAdjustmentSubmit = async (values) => {
    try {
      await inventoryAPI.updateStock(
        selectedProduct.id,
        values.newStock,
        values.notes
      );

      setAdjustmentModalVisible(false);
      fetchInventory(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  // Product table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.barcode && (
            <Text type="secondary">SKU: {record.barcode}</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: "category_name",
      key: "category_name",
      render: (text) => text || "Uncategorized",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock, record) => {
        const isLowStock = stock <= record.min_stock;
        const isOutOfStock = stock === 0;

        let color = "green";
        let status = "Normal";

        if (isOutOfStock) {
          color = "red";
          status = "Out of Stock";
        } else if (isLowStock) {
          color = "orange";
          status = "Low Stock";
        }

        return (
          <Space direction="vertical" size={0}>
            <Text strong>{stock}</Text>
            <Tag color={color}>{status}</Tag>
          </Space>
        );
      },
    },
    {
      title: "Min Stock",
      dataIndex: "min_stock",
      key: "min_stock",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => formatCurrency(price),
    },
    {
      title: "Value",
      key: "value",
      render: (_, record) => formatCurrency(record.stock * record.price),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Adjust Stock">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleStockAdjustment(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="View Movements">
            <Button
              icon={<LineChartOutlined />}
              onClick={() =>
                navigate(`/admin/inventory/movements?product=${record.id}`)
              }
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="inventory-dashboard">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>Inventory Dashboard</Title>
        </Col>
      </Row>

      {/* Summary stats */}
      <Row gutter={16} className="summary-cards">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Products"
              value={summary.total_products}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Low Stock"
              value={summary.low_stock}
              valueStyle={{ color: "#faad14" }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Out of Stock"
              value={summary.out_of_stock}
              valueStyle={{ color: "#f5222d" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Value"
              value={formatCurrency(summary.total_value)}
              prefix="₫"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Alerts section */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title="Inventory Alerts"
            extra={
              <Button type="link" onClick={fetchAlerts}>
                <ReloadOutlined />
              </Button>
            }
          >
            {alertsLoading ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin />
              </div>
            ) : alerts.length > 0 ? (
              <ul className="alert-list">
                {alerts.map((item) => (
                  <li key={item.id}>
                    <Alert
                      message={`${item.name} is low on stock (${item.stock} remaining)`}
                      description={`Current stock is below minimum level (${item.min_stock}). Consider restocking.`}
                      type="warning"
                      showIcon
                      action={
                        <Button
                          size="small"
                          onClick={() => handleStockAdjustment(item)}
                        >
                          Adjust
                        </Button>
                      }
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty description="No alerts at the moment" />
            )}

            {alerts.length > 0 && (
              <div style={{ textAlign: "right", marginTop: "10px" }}>
                <Button
                  type="link"
                  onClick={() => navigate("/admin/inventory/low-stock")}
                >
                  View All
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Filters */}
      <Row gutter={[16, 16]} className="filter-row">
        <Col xs={24} sm={8}>
          <Input
            placeholder="Search products"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={6}>
          <Select
            placeholder="Category"
            style={{ width: "100%" }}
            value={filters.category_id}
            onChange={(value) => handleFilterChange("category_id", value)}
            allowClear
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={6}>
          <Select
            placeholder="Stock Status"
            style={{ width: "100%" }}
            value={filters.low_stock ? "low" : undefined}
            onChange={(value) =>
              handleFilterChange("low_stock", value === "low")
            }
            allowClear
          >
            <Option value="low">Low Stock</Option>
          </Select>
        </Col>
        <Col xs={24} sm={4}>
          <Space>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={applyFilters}
            >
              Filter
            </Button>
            <Button onClick={resetFilters}>Reset</Button>
          </Space>
        </Col>
      </Row>

      {/* Products table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              loading={loading}
              onChange={handleTableChange}
              size="middle"
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        visible={adjustmentModalVisible}
        product={selectedProduct}
        onCancel={() => setAdjustmentModalVisible(false)}
        onSubmit={handleAdjustmentSubmit}
      />
    </div>
  );
};

export default InventoryDashboard;
