#!/usr/bin/env node
/**
 * KhoAugment Integration Tests - Remote Test Runner
 *
 * Script để chạy các bộ kiểm thử từ xa qua API của Cloudflare Workers
 */

import fetch from "node-fetch";
import * as readline from "readline";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

// Lấy URL từ tham số hoặc sử dụng giá trị mặc định
const WORKER_URL =
  process.argv[2] ||
  "https://khoaugment-integration-tests-20250712075822.bangachieu2.workers.dev";

// Cấu hình kiểm thử
const config = {
  testSuites: [
    { id: "all", name: "Tất cả các kiểm thử" },
    { id: "api", name: "Kiểm thử API" },
    { id: "frontend", name: "Kiểm thử giao diện" },
    { id: "d1", name: "Kiểm thử D1 Database" },
    { id: "r2", name: "Kiểm thử R2 Storage" },
    { id: "vietnamese", name: "Kiểm thử tiếng Việt" },
  ],
  browsers: [
    { id: "chrome", name: "Google Chrome" },
    { id: "firefox", name: "Mozilla Firefox" },
    { id: "webkit", name: "WebKit/Safari" },
  ],
};

// Banner
console.log(
  `${colors.blue}=======================================${colors.reset}`
);
console.log(
  `${colors.blue}  KhoAugment Remote Test Runner        ${colors.reset}`
);
console.log(
  `${colors.blue}=======================================${colors.reset}`
);
console.log(`${colors.gray}Worker URL: ${WORKER_URL}${colors.reset}\n`);

// Tạo giao diện dòng lệnh tương tác
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Kiểm tra kết nối
async function checkHealth() {
  try {
    console.log(`${colors.cyan}Kiểm tra kết nối với Worker...${colors.reset}`);
    const response = await fetch(`${WORKER_URL}/api/health`);

    if (!response.ok) {
      throw new Error(`API trả về mã lỗi ${response.status}`);
    }

    const data = await response.json();
    console.log(`${colors.green}✓ Kết nối thành công${colors.reset}`);
    console.log(`${colors.gray}Phiên bản: ${data.version}${colors.reset}`);
    console.log(
      `${colors.gray}Datacenter: ${data.cloudflare?.datacenter || "unknown"}${
        colors.reset
      }`
    );

    if (data.vietnamese?.support) {
      console.log(`${colors.green}✓ Hỗ trợ tiếng Việt: Có${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Hỗ trợ tiếng Việt: Không${colors.reset}`);
    }

    return true;
  } catch (error) {
    console.error(
      `${colors.red}✗ Lỗi khi kết nối: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Chạy các bài kiểm tra
async function runTests(testSuite, browser, headless) {
  try {
    console.log(`\n${colors.cyan}Đang chạy kiểm thử...${colors.reset}`);
    console.log(`${colors.gray}Bộ kiểm thử: ${testSuite}${colors.reset}`);
    console.log(
      `${colors.gray}Trình duyệt: ${browser} (${
        headless ? "headless" : "có giao diện"
      })${colors.reset}`
    );

    const response = await fetch(`${WORKER_URL}/api/run-tests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ testSuite, browser, headless }),
    });

    if (!response.ok) {
      throw new Error(`API trả về mã lỗi ${response.status}`);
    }

    const result = await response.json();
    const { success, results, tests } = result;

    console.log(`\n${colors.blue}Kết quả kiểm thử:${colors.reset}`);
    console.log(
      `${colors.gray}Tổng số: ${results.total} kiểm thử${colors.reset}`
    );
    console.log(
      `${colors.green}✓ Thành công: ${results.passed}${colors.reset}`
    );
    console.log(`${colors.red}✗ Thất bại: ${results.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Bỏ qua: ${results.skipped}${colors.reset}`);
    console.log(
      `${colors.gray}Thời gian: ${results.duration}ms${colors.reset}`
    );

    console.log(`\n${colors.blue}Chi tiết kiểm thử:${colors.reset}`);
    tests.forEach((test) => {
      const statusColor =
        test.status === "passed"
          ? colors.green
          : test.status === "failed"
          ? colors.red
          : colors.yellow;
      const statusSymbol =
        test.status === "passed" ? "✓" : test.status === "failed" ? "✗" : "⚠";
      console.log(
        `${statusColor}${statusSymbol} ${test.name} (${test.duration}ms)${colors.reset}`
      );

      if (test.error) {
        console.log(`  ${colors.red}Lỗi: ${test.error}${colors.reset}`);
      }
    });

    return success;
  } catch (error) {
    console.error(
      `${colors.red}✗ Lỗi khi chạy kiểm thử: ${error.message}${colors.reset}`
    );
    return false;
  }
}

// Menu chọn bộ kiểm thử
function selectTestSuite() {
  return new Promise((resolve) => {
    console.log(`\n${colors.blue}Chọn bộ kiểm thử:${colors.reset}`);
    config.testSuites.forEach((suite, index) => {
      console.log(
        `${colors.gray}${index + 1}) ${suite.name} (${suite.id})${colors.reset}`
      );
    });

    rl.question(
      `${colors.yellow}Nhập số (1-${config.testSuites.length}): ${colors.reset}`,
      (answer) => {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < config.testSuites.length) {
          resolve(config.testSuites[index].id);
        } else {
          console.log(
            `${colors.red}Lựa chọn không hợp lệ, sử dụng giá trị mặc định 'all'${colors.reset}`
          );
          resolve("all");
        }
      }
    );
  });
}

// Menu chọn trình duyệt
function selectBrowser() {
  return new Promise((resolve) => {
    console.log(`\n${colors.blue}Chọn trình duyệt:${colors.reset}`);
    config.browsers.forEach((browser, index) => {
      console.log(
        `${colors.gray}${index + 1}) ${browser.name} (${browser.id})${
          colors.reset
        }`
      );
    });

    rl.question(
      `${colors.yellow}Nhập số (1-${config.browsers.length}): ${colors.reset}`,
      (answer) => {
        const index = parseInt(answer) - 1;
        if (index >= 0 && index < config.browsers.length) {
          resolve(config.browsers[index].id);
        } else {
          console.log(
            `${colors.red}Lựa chọn không hợp lệ, sử dụng giá trị mặc định 'chrome'${colors.reset}`
          );
          resolve("chrome");
        }
      }
    );
  });
}

// Lựa chọn chế độ headless
function selectHeadlessMode() {
  return new Promise((resolve) => {
    rl.question(
      `\n${colors.yellow}Chạy ở chế độ headless? (y/n): ${colors.reset}`,
      (answer) => {
        resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
      }
    );
  });
}

// Hàm chính
async function main() {
  try {
    // Kiểm tra kết nối
    const isConnected = await checkHealth();
    if (!isConnected) {
      console.log(
        `${colors.red}Không thể kết nối tới Worker, vui lòng kiểm tra URL và thử lại${colors.reset}`
      );
      rl.close();
      return;
    }

    // Chọn bộ kiểm thử
    const testSuite = await selectTestSuite();

    // Chọn trình duyệt
    const browser = await selectBrowser();

    // Chọn chế độ headless
    const headless = await selectHeadlessMode();

    // Chạy kiểm thử
    await runTests(testSuite, browser, headless);

    // Hỏi người dùng có muốn chạy lại không
    rl.question(
      `\n${colors.yellow}Bạn có muốn chạy một bộ kiểm thử khác không? (y/n): ${colors.reset}`,
      (answer) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          main();
        } else {
          console.log(`\n${colors.green}Hoàn thành!${colors.reset}`);
          rl.close();
        }
      }
    );
  } catch (error) {
    console.error(`${colors.red}Lỗi: ${error.message}${colors.reset}`);
    rl.close();
  }
}

// Bắt đầu chương trình
main();
