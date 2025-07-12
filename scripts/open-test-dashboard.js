#!/usr/bin/env node
/**
 * KhoAugment Integration Tests - Dashboard Opener
 * Script để mở dashboard kiểm thử trong trình duyệt
 */

import open from "open";

// Lấy URL từ tham số hoặc sử dụng giá trị mặc định
const WORKER_URL =
  process.argv[2] ||
  "https://khoaugment-integration-tests-20250712075822.bangachieu2.workers.dev";

console.log(`\x1b[34m======================================\x1b[0m`);
console.log(`\x1b[34m  Mở Dashboard Kiểm Thử KhoAugment   \x1b[0m`);
console.log(`\x1b[34m======================================\x1b[0m`);
console.log(`\x1b[90mĐang mở: ${WORKER_URL}\x1b[0m\n`);

// Mở URL trong trình duyệt mặc định
open(WORKER_URL)
  .then(() => {
    console.log(`\x1b[32m✓ Đã mở dashboard trong trình duyệt\x1b[0m`);
  })
  .catch((err) => {
    console.error(`\x1b[31m✗ Không thể mở trình duyệt: ${err.message}\x1b[0m`);
    console.log(`\x1b[33mVui lòng mở thủ công URL: ${WORKER_URL}\x1b[0m`);
  });

// Hiển thị các tính năng dashboard
console.log(`\x1b[36mCác tính năng dashboard:\x1b[0m`);
console.log(`\x1b[90m- Kiểm tra sức khỏe API\x1b[0m`);
console.log(`\x1b[90m- Chạy các bộ kiểm thử\x1b[0m`);
console.log(`\x1b[90m- Kiểm tra hỗ trợ tiếng Việt\x1b[0m`);
