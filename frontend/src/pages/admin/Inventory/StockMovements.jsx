import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  AuditOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { inventoryAPI } from "../../../services/api.ts";
import { formatDate } from "../../../utils/helpers/formatters";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * Stock Movements component to track inventory changes
 */
const StockMovements = () => {
  const [loading, setLoading] = useState(true);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    product_id: undefined,
    movement_type: undefined,
    date_from: null,
    date_to: null,
    search: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  // Initialize filters from query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get("product");

    if (productId) {
      setFilters((prev) => ({
        ...prev,
        product_id: parseInt(productId),
      }));
    }

    // Fetch products for filter dropdown
    fetchProducts();
  }, [location]);

  // Fetch initial data
  useEffect(() => {
    if (filters.product_id) {
      fetchMovements();
    } else {
      setLoading(false);
    }
  }, [filters.product_id]);

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const result = await inventoryAPI.getInventory({ limit: 100 });
      setProducts(result.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Fetch movement data
  const fetchMovements = async (page = 1, pageSize = 10) => {
    if (!filters.product_id) return;

    setLoading(true);
    try {
      const data = await inventoryAPI.getMovements(filters.product_id, {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      setMovements(data || []);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: data.length > 0 ? data.length + (page - 1) * pageSize : 0, // Estimate total for pagination
      });
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    // Update URL with product filter
    if (filters.product_id) {
      navigate(`/admin/inventory/movements?product=${filters.product_id}`);
    } else {
      navigate("/admin/inventory/movements");
    }

    fetchMovements(1, pagination.pageSize);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      product_id: undefined,
      movement_type: undefined,
      date_from: null,
      date_to: null,
      search: "",
    });
    navigate("/admin/inventory/movements");
  };

  // Handle table change (pagination)
  const handleTableChange = (pagination) => {
    fetchMovements(pagination.current, pagination.pageSize);
  };

  // Get movement type tag color
  const getMovementTypeTag = (type) => {
    switch (type) {
      case "purchase":
        return <Tag color="green">Purchase</Tag>;
      case "sale":
        return <Tag color="blue">Sale</Tag>;
      case "adjustment":
        return <Tag color="orange">Adjustment</Tag>;
      case "return":
        return <Tag color="purple">Return</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  // Get stock change display
  const getStockChangeDisplay = (record) => {
    if (record.quantity_change > 0) {
      return (
        <Text type="success">
          <ArrowUpOutlined /> +{record.quantity_change}
        </Text>
      );
    } else {
      return (
        <Text type="danger">
          <ArrowDownOutlined /> {record.quantity_change}
        </Text>
      );
    }
  };

  // Table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => formatDate(date, "DD/MM/YYYY HH:mm"),
    },
    {
      title: "Movement Type",
      dataIndex: "movement_type",
      key: "movement_type",
      render: (type) => getMovementTypeTag(type),
    },
    {
      title: "Change",
      key: "change",
      render: (_, record) => getStockChangeDisplay(record),
    },
    {
      title: "Stock Before",
      dataIndex: "quantity_before",
      key: "quantity_before",
    },
    {
      title: "Stock After",
      dataIndex: "quantity_after",
      key: "quantity_after",
    },
    {
      title: "Reference",
      key: "reference",
      render: (_, record) => {
        if (record.reference_id && record.reference_type) {
          let link = "#";
          let label = `${record.reference_type} #${record.reference_id}`;

          if (record.reference_type === "order") {
            link = `/admin/orders/${record.reference_id}`;
            label = `Order #${record.reference_id}`;
          } else if (record.reference_type === "return") {
            link = `/admin/returns/${record.reference_id}`;
            label = `Return #${record.reference_id}`;
          }

          return (
            <a
              href={link}
              onClick={(e) => {
                if (link === "#") e.preventDefault();
              }}
            >
              {label}
            </a>
          );
        }
        return "-";
      },
    },
    {
      title: "User",
      dataIndex: "user_name",
      key: "user_name",
      render: (text) => text || "System",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text) => {
        if (!text) return "-";
        return (
          <Tooltip title={text} placement="topLeft">
            <div
              style={{
                maxWidth: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </div>
          </Tooltip>
        );
      },
    },
  ];

  // Get current product name
  const getCurrentProductName = () => {
    if (!filters.product_id) return "";
    const product = products.find((p) => p.id === filters.product_id);
    return product ? product.name : `Product #${filters.product_id}`;
  };

  return (
    <div className="stock-movements">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>
            <AuditOutlined /> Stock Movement History
          </Title>
          {filters.product_id && (
            <Text>
              Showing movements for:{" "}
              <Text strong>{getCurrentProductName()}</Text>
            </Text>
          )}
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Select Product"
              style={{ width: "100%" }}
              value={filters.product_id}
              onChange={(value) => handleFilterChange("product_id", value)}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              allowClear
            >
              {products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Movement Type"
              style={{ width: "100%" }}
              value={filters.movement_type}
              onChange={(value) => handleFilterChange("movement_type", value)}
              allowClear
            >
              <Option value="purchase">Purchase</Option>
              <Option value="sale">Sale</Option>
              <Option value="adjustment">Adjustment</Option>
              <Option value="return">Return</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={7}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates) => {
                if (dates) {
                  handleFilterChange("date_from", dates[0]);
                  handleFilterChange("date_to", dates[1]);
                } else {
                  handleFilterChange("date_from", null);
                  handleFilterChange("date_to", null);
                }
              }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Space>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={applyFilters}
                disabled={!filters.product_id}
              >
                Apply Filters
              </Button>
              <Button onClick={resetFilters}>Reset</Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchMovements(pagination.current, pagination.pageSize)
                }
                disabled={!filters.product_id}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            icon={<DownloadOutlined />}
            disabled={movements.length === 0}
            onClick={() => console.log("Export CSV")}
          >
            Export
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={movements}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total) => `Total ${total} movements`,
          }}
          loading={loading}
          onChange={handleTableChange}
          locale={{
            emptyText: filters.product_id
              ? "No movement records found"
              : "Please select a product to view movement history",
          }}
        />
      </Card>
    </div>
  );
};

export default StockMovements;
