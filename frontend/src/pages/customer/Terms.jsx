import React from 'react';
import { Typography, Card, Collapse, Divider, Alert } from 'antd';
import { InfoCircleOutlined, WarningOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const Terms = () => {
  return (
    <div>
      <Title level={2} className="text-center mb-6">Điều khoản bảo hành</Title>
      
      <Alert
        message="Lưu ý quan trọng"
        description="Quý khách vui lòng đọc kỹ điều khoản bảo hành trước khi mua sản phẩm. Việc sử dụng sản phẩm đồng nghĩa với việc chấp nhận các điều khoản bảo hành dưới đây."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="mb-6"
      />
      
      <Card className="mb-6">
        <Title level={3}>Chính sách bảo hành</Title>
        <Paragraph>
          Trường Phát Computer cam kết cung cấp dịch vụ bảo hành chất lượng cao cho tất cả sản phẩm được mua tại cửa hàng. 
          Chúng tôi áp dụng chính sách bảo hành theo tiêu chuẩn của nhà sản xuất và có thể mở rộng thêm tùy theo từng sản phẩm.
        </Paragraph>
        
        <Title level={4}>Thời hạn bảo hành</Title>
        <Paragraph>
          <ul>
            <li>Linh kiện máy tính (CPU, Mainboard, RAM, SSD, HDD): 36 tháng</li>
            <li>Màn hình máy tính: 36 tháng</li>
            <li>Laptop: 12 tháng</li>
            <li>Thiết bị ngoại vi (Chuột, Bàn phím, Tai nghe): 12 tháng</li>
            <li>Thiết bị mạng: 24 tháng</li>
            <li>Phụ kiện khác: 3-6 tháng tùy sản phẩm</li>
          </ul>
        </Paragraph>
        
        <Alert
          message="Lưu ý về thời hạn bảo hành"
          description="Thời hạn bảo hành được tính từ ngày mua hàng ghi trên hóa đơn. Một số sản phẩm có thể có thời hạn bảo hành khác, vui lòng kiểm tra thông tin trên hóa đơn hoặc phiếu bảo hành."
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          className="mb-4"
        />
      </Card>
      
      <Card className="mb-6">
        <Title level={3}>Điều kiện bảo hành</Title>
        
        <Collapse defaultActiveKey={['1']} className="mb-4">
          <Panel header="Điều kiện được bảo hành" key="1">
            <ul>
              <li>Sản phẩm còn trong thời hạn bảo hành và có tem bảo hành nguyên vẹn</li>
              <li>Sản phẩm bị lỗi do nhà sản xuất</li>
              <li>Sản phẩm được sử dụng đúng mục đích, công năng và theo hướng dẫn của nhà sản xuất</li>
              <li>Có hóa đơn mua hàng hoặc phiếu bảo hành của Trường Phát Computer</li>
            </ul>
          </Panel>
          
          <Panel header="Điều kiện không được bảo hành" key="2">
            <ul>
              <li>Sản phẩm hết thời hạn bảo hành</li>
              <li>Tem bảo hành, mã sản phẩm, số serial bị rách, mờ hoặc có dấu hiệu chỉnh sửa</li>
              <li>Sản phẩm bị hư hỏng do thiên tai, hỏa hoạn, lụt lội, sét đánh</li>
              <li>Sản phẩm bị hư hỏng do sử dụng sai mục đích, sử dụng không đúng hướng dẫn</li>
              <li>Sản phẩm bị hư hỏng do va chạm, rơi, vỡ, cháy nổ, côn trùng xâm nhập</li>
              <li>Sản phẩm có dấu hiệu đã được sửa chữa bởi đơn vị không được ủy quyền</li>
            </ul>
          </Panel>
        </Collapse>
        
        <Alert
          message="Chú ý"
          description="Trường Phát Computer có quyền từ chối bảo hành nếu sản phẩm không đáp ứng các điều kiện bảo hành nêu trên."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          className="mb-4"
        />
      </Card>
      
      <Card className="mb-6">
        <Title level={3}>Quy trình bảo hành</Title>
        
        <ol className="list-decimal pl-6 mb-4">
          <li className="mb-2">
            <Text strong>Tiếp nhận yêu cầu bảo hành:</Text>
            <ul className="list-disc pl-6 mt-1">
              <li>Khách hàng mang sản phẩm đến trực tiếp cửa hàng Trường Phát Computer</li>
              <li>Hoặc liên hệ qua hotline để được hướng dẫn</li>
            </ul>
          </li>
          
          <li className="mb-2">
            <Text strong>Kiểm tra tình trạng sản phẩm:</Text>
            <ul className="list-disc pl-6 mt-1">
              <li>Nhân viên kỹ thuật sẽ kiểm tra và xác định lỗi của sản phẩm</li>
              <li>Kiểm tra điều kiện bảo hành (tem, thời hạn, hóa đơn)</li>
            </ul>
          </li>
          
          <li className="mb-2">
            <Text strong>Xử lý bảo hành:</Text>
            <ul className="list-disc pl-6 mt-1">
              <li>Sửa chữa tại chỗ (nếu có thể)</li>
              <li>Gửi về nhà sản xuất (thời gian 7-15 ngày tùy sản phẩm)</li>
              <li>Đổi sản phẩm mới tương đương nếu không thể sửa chữa</li>
            </ul>
          </li>
          
          <li className="mb-2">
            <Text strong>Trả sản phẩm:</Text>
            <ul className="list-disc pl-6 mt-1">
              <li>Thông báo cho khách hàng khi hoàn thành bảo hành</li>
              <li>Khách hàng kiểm tra sản phẩm trước khi nhận</li>
            </ul>
          </li>
        </ol>
        
        <Divider />
        
        <Title level={4}>Thời gian xử lý bảo hành</Title>
        <Paragraph>
          <ul>
            <li>Bảo hành tại chỗ: 1-3 ngày làm việc</li>
            <li>Bảo hành qua nhà sản xuất: 7-15 ngày làm việc</li>
            <li>Trường hợp đặc biệt: sẽ thông báo cụ thể cho khách hàng</li>
          </ul>
        </Paragraph>
      </Card>
      
      <Card className="mb-6">
        <Title level={3}>Bảo hành mở rộng</Title>
        <Paragraph>
          Ngoài chính sách bảo hành tiêu chuẩn, Trường Phát Computer còn cung cấp dịch vụ bảo hành mở rộng 
          giúp khách hàng an tâm sử dụng sản phẩm trong thời gian dài hơn.
        </Paragraph>
        
        <Title level={4}>Các gói bảo hành mở rộng</Title>
        <ul>
          <li>Gói bảo hành +12 tháng: Tăng thêm 12 tháng bảo hành</li>
          <li>Gói bảo hành +24 tháng: Tăng thêm 24 tháng bảo hành</li>
          <li>Gói bảo hành VIP: Bảo hành tận nơi, ưu tiên xử lý</li>
        </ul>
        
        <Paragraph>
          Để biết thêm chi tiết về các gói bảo hành mở rộng và chi phí, vui lòng liên hệ nhân viên cửa hàng.
        </Paragraph>
      </Card>
      
      <Card>
        <Title level={3}>Liên hệ hỗ trợ</Title>
        <Paragraph>
          Nếu quý khách có bất kỳ thắc mắc nào về chính sách bảo hành hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi:
        </Paragraph>
        
        <ul className="list-none pl-0">
          <li className="mb-2">
            <PhoneOutlined className="mr-2" /> Hotline: <Text strong>1900 1234</Text> (8:00 - 21:00, cả T7 & CN)
          </li>
          <li className="mb-2">
            <InfoCircleOutlined className="mr-2" /> Email: <Text strong>baohanh@truongphatcomputer.vn</Text>
          </li>
          <li>
            <InfoCircleOutlined className="mr-2" /> Địa chỉ: <Text strong>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</Text>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default Terms; 