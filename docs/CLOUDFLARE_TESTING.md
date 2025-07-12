# Kiểm thử KhoAugment POS trên Cloudflare

## Tổng quan

Tài liệu này hướng dẫn cách sử dụng hệ thống kiểm thử KhoAugment POS trên nền tảng Cloudflare, bao gồm:

- Dashboard kiểm thử trên Cloudflare Workers
- Các script chạy kiểm thử từ xa
- Kiểm thử với hỗ trợ tiếng Việt
- Xử lý các vấn đề thường gặp

## 1. Dashboard kiểm thử trên Cloudflare

### 1.1. Truy cập dashboard

Dashboard kiểm thử đã được triển khai tại:

```
https://khoaugment-integration-tests-20250712075822.bangachieu2.workers.dev
```

Sử dụng script để mở dashboard trong trình duyệt:

```bash
node scripts/open-test-dashboard.js
```

### 1.2. Các tính năng của dashboard

Dashboard cung cấp các tính năng sau:

- **Kiểm tra sức khỏe API**: Xác nhận kết nối đến API backend
- **Chạy kiểm thử**: Khởi chạy các bộ kiểm thử khác nhau
- **Kiểm tra hỗ trợ tiếng Việt**: Xác minh hiển thị đúng văn bản tiếng Việt

### 1.3. Cách sử dụng dashboard

1. Mở dashboard trong trình duyệt
2. Kiểm tra trạng thái kết nối bằng nút "Check Health"
3. Chọn bộ kiểm thử và trình duyệt
4. Nhấn "Run Tests" để chạy kiểm thử
5. Xem kết quả kiểm thử

## 2. Chạy kiểm thử từ xa

### 2.1. Script chạy kiểm thử

Sử dụng script `run-remote-tests.js` để chạy kiểm thử từ dòng lệnh:

```bash
node scripts/run-remote-tests.js [worker-url]
```

Trong đó `[worker-url]` là URL của Worker dashboard kiểm thử (tùy chọn).

### 2.2. Bộ kiểm thử có sẵn

Script cung cấp các bộ kiểm thử sau:

1. **Tất cả các kiểm thử** (`all`): Chạy toàn bộ bộ kiểm thử
2. **Kiểm thử API** (`api`): Kiểm tra các endpoint API
3. **Kiểm thử giao diện** (`frontend`): Kiểm tra giao diện người dùng
4. **Kiểm thử D1 Database** (`d1`): Kiểm tra hiệu suất và khả năng kết nối D1
5. **Kiểm thử R2 Storage** (`r2`): Kiểm tra tải lên và truy xuất R2
6. **Kiểm thử tiếng Việt** (`vietnamese`): Kiểm tra hỗ trợ tiếng Việt

### 2.3. Trình duyệt được hỗ trợ

Script hỗ trợ chạy kiểm thử trên các trình duyệt:

1. **Google Chrome** (`chrome`)
2. **Mozilla Firefox** (`firefox`)
3. **WebKit/Safari** (`webkit`)

## 3. Triển khai dashboard kiểm thử lên Cloudflare

### 3.1. Triển khai lên Worker mới

Sử dụng script `deploy-tests-cloudflare-fixed.sh` để triển khai dashboard lên Cloudflare Workers:

```bash
./scripts/deploy-tests-cloudflare-fixed.sh
```

Script sẽ:

- Tạo một Worker với tên duy nhất
- Triển khai mã nguồn dashboard
- Cung cấp URL để truy cập

### 3.2. Yêu cầu

- Cài đặt Wrangler CLI: `npm install -g wrangler`
- Đã đăng nhập vào Cloudflare: `wrangler login`
- Có tài khoản Cloudflare với quyền triển khai Workers

### 3.3. Tùy chỉnh triển khai

Để tùy chỉnh triển khai, bạn có thể:

- Chỉnh sửa `scripts/cloudflare-test-config.js` để cấu hình môi trường
- Sửa `scripts/deploy-tests-cloudflare-fixed.sh` để thay đổi tên hoặc cấu hình Worker
- Cập nhật HTML dashboard trong file triển khai

## 4. Kiểm thử với hỗ trợ tiếng Việt

### 4.1. Cách kiểm thử tiếng Việt

Kiểm thử hỗ trợ tiếng Việt bao gồm:

- Hiển thị đúng các ký tự tiếng Việt
- Xử lý đúng dữ liệu nhập/xuất tiếng Việt
- Sắp xếp và tìm kiếm với các ký tự tiếng Việt

### 4.2. Các ký tự tiếng Việt được kiểm tra

Hệ thống kiểm thử các ký tự tiếng Việt sau:

- Các chữ cái có dấu: ă, â, đ, ê, ô, ơ, ư
- Các dấu: huyền, sắc, hỏi, ngã, nặng
- Ví dụ: "Xin chào Việt Nam", "Cà phê Trung Nguyên"

### 4.3. Thiết lập môi trường tiếng Việt

Để thiết lập môi trường hỗ trợ tiếng Việt:

```bash
# Thiết lập locale tiếng Việt
export LANG=vi_VN.UTF-8
export LC_ALL=vi_VN.UTF-8

# Chạy kiểm thử tiếng Việt
node scripts/run-remote-tests.js
# Sau đó chọn bộ kiểm thử "vietnamese"
```

## 5. Hướng dẫn nâng cao

### 5.1. Tích hợp với CI/CD

Để tích hợp vào quy trình CI/CD:

1. Sử dụng GitHub workflow tại `.github/workflows/integration-tests.yml`
2. Thiết lập các secrets cần thiết:
   - `TEST_API_URL`
   - `TEST_BASE_URL`
   - `TEST_USER_EMAIL`
   - `TEST_USER_PASSWORD`
3. Kích hoạt workflow trên push hoặc pull request

### 5.2. Báo cáo kiểm thử

Kết quả kiểm thử được hiển thị:

- Trực tiếp trong terminal khi chạy script
- Trên dashboard web
- Trong tệp JSON tại `test-results/integration-results.json`

### 5.3. Tùy chỉnh kiểm thử

Để tùy chỉnh kiểm thử:

1. Sửa `tests/integration-suite.js` để thêm/sửa bài kiểm thử
2. Cập nhật `tests/integration.config.js` cho cấu hình Playwright
3. Điều chỉnh `tests/integration-global-setup.js` cho cấu hình môi trường

## 6. Xử lý sự cố

### 6.1. Lỗi kết nối Worker

Nếu không thể kết nối đến Worker:

1. Kiểm tra URL Worker có đúng không
2. Xác nhận Worker đang hoạt động bằng cách mở URL trong trình duyệt
3. Kiểm tra kết nối mạng và tường lửa
4. Triển khai lại Worker bằng script `deploy-tests-cloudflare-fixed.sh`

### 6.2. Lỗi kiểm thử

Nếu kiểm thử thất bại:

1. Kiểm tra chi tiết lỗi trong kết quả kiểm thử
2. Xác nhận môi trường kiểm thử (URLs, credentials) đã chính xác
3. Kiểm tra log để biết thêm chi tiết
4. Đối với lỗi VNPay, kiểm tra cấu hình tích hợp thanh toán

### 6.3. Vấn đề hiển thị tiếng Việt

Nếu gặp vấn đề với tiếng Việt:

1. Kiểm tra bảng mã của terminal (phải là UTF-8)
2. Xác nhận font chữ hỗ trợ tiếng Việt
3. Kiểm tra headers `Content-Type` có `charset=UTF-8` không
4. Xác nhận database collation hỗ trợ Unicode

## 7. Tài liệu tham khảo

- [Tài liệu Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Tài liệu Playwright](https://playwright.dev/docs/intro)
- [Hướng dẫn kiểm thử KhoAugment](docs/TESTING.md)
- [Cấu hình D1 Database](docs/DATABASE.md)
- [Cấu hình R2 Storage](docs/STORAGE.md)

## 8. Thông tin liên hệ

Nếu bạn cần hỗ trợ hoặc có câu hỏi về hệ thống kiểm thử:

- **Email:** support@khoaugment.com
- **Discord:** https://discord.gg/khoaugment
- **GitHub:** Tạo issue tại repository

---

Cập nhật lần cuối: Ngày 12 tháng 7 năm 2025
