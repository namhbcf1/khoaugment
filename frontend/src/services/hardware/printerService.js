/**
 * Printer Service - Real implementation for POS receipt printing
 * Uses browser printing capabilities and WebUSB for compatible receipt printers
 */

// ESC/POS Commands
const ESC = 0x1B;
const GS = 0x1D;
const LF = 0x0A;
const CR = 0x0D;
const HT = 0x09;
const DLE = 0x10;
const EOT = 0x04;
const ENQ = 0x05;
const SP = 0x20;
const FS = 0x1C;
const FF = 0x0C;

// ESC/POS Command functions
const COMMANDS = {
  INITIALIZE: [ESC, 0x40],
  LINE_FEED: [LF],
  FORM_FEED: [FF],
  CUT_PAPER: [GS, 0x56, 0x00],
  CUT_PAPER_PARTIAL: [GS, 0x56, 0x01],
  EMPHASIZE_ON: [ESC, 0x45, 0x01],
  EMPHASIZE_OFF: [ESC, 0x45, 0x00],
  DOUBLE_HEIGHT_ON: [ESC, 0x21, 0x10],
  DOUBLE_HEIGHT_OFF: [ESC, 0x21, 0x00],
  DOUBLE_WIDTH_ON: [ESC, 0x21, 0x20],
  DOUBLE_WIDTH_OFF: [ESC, 0x21, 0x00],
  UNDERLINE_ON: [ESC, 0x2D, 0x01],
  UNDERLINE_OFF: [ESC, 0x2D, 0x00],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_RIGHT: [ESC, 0x61, 0x02],
  INVERT_ON: [GS, 0x42, 0x01],
  INVERT_OFF: [GS, 0x42, 0x00],
  CHAR_SIZE_NORMAL: [ESC, 0x21, 0x00],
  CHAR_SIZE_DOUBLE_HEIGHT: [ESC, 0x21, 0x10],
  CHAR_SIZE_DOUBLE_WIDTH: [ESC, 0x21, 0x20],
  CHAR_SIZE_QUAD: [ESC, 0x21, 0x30],
  OPEN_CASH_DRAWER: [ESC, 0x70, 0x00, 0x19, 0xFA],
  BEEP: [BEL],
  PRINT_AND_FEED: (lines) => [ESC, 0x64, lines],
  SET_LINE_SPACING: (spacing) => [ESC, 0x33, spacing],
  RESET_LINE_SPACING: [ESC, 0x32],
  PRINT_BARCODE: (type, data) => {
    const commands = [GS, 0x6B, type];
    const encoder = new TextEncoder();
    return [...commands, ...encoder.encode(data), 0x00];
  },
  PRINT_QR_CODE: (data, size = 6) => {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const dataLength = dataBytes.length;
    
    // QR Code model, size, error correction
    return [
      GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, 0x32, // Model 2
      GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, size, // Size
      GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x50, 0x30, // Error correction (L)
      GS, 0x28, 0x6B, (dataLength + 3) & 0xff, ((dataLength + 3) >> 8) & 0xff, 0x31, 0x50, 0x30, ...dataBytes,
      GS, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30  // Print QR Code
    ];
  }
};

class PrinterService {
  constructor() {
    this.connected = false;
    this.printerName = null;
    this.usbDevice = null;
    this.supportedPrinters = [
      { vendorId: 0x0483, productId: 0x5743 }, // Star Micronics
      { vendorId: 0x04b8, productId: 0x0202 }, // Epson
      { vendorId: 0x067b, productId: 0x2303 }, // Prolific
      { vendorId: 0x0525, productId: 0xa700 }, // Xprinter
      { vendorId: 0x1504, productId: 0x0006 }, // Sunmi
      { vendorId: 0x0416, productId: 0x5011 }, // Rongta
      { vendorId: 0x0fe6, productId: 0x811e }  // Sewoo
    ];
    this.encoder = new TextEncoder();
    this.defaultConfig = {
      characterSet: 'vietnam',
      codePage: 'cp858',
      paperWidth: 80, // mm
      dpi: 203, // dots per inch
      charWidth: 12, // dots
      charHeight: 24 // dots
    };
  }

  /**
   * Check if WebUSB is supported by the browser
   * @returns {boolean} WebUSB support status
   */
  isWebUSBSupported() {
    return navigator && navigator.usb && typeof navigator.usb.requestDevice === 'function';
  }

  /**
   * Connect to a USB receipt printer
   * @returns {Promise<boolean>} Connection success
   */
  async connectUSB() {
    if (!this.isWebUSBSupported()) {
      throw new Error('WebUSB not supported in this browser');
    }
    
    try {
      // Request a USB device
      this.usbDevice = await navigator.usb.requestDevice({
        filters: this.supportedPrinters
      });
      
      await this.usbDevice.open();
      
      // Select configuration #1
      if (this.usbDevice.configuration === null) {
        await this.usbDevice.selectConfiguration(1);
      }
      
      // Find the first output endpoint
      const interfaceNumber = 0;
      const endpointNumber = 1;
      
      // Claim interface
      await this.usbDevice.claimInterface(interfaceNumber);
      
      this.connected = true;
      this.printerName = `${this.usbDevice.manufacturerName || 'Unknown'} ${this.usbDevice.productName || 'Printer'}`;
      
      console.log(`Connected to printer: ${this.printerName}`);
      
      // Initialize printer
      await this.sendCommand(COMMANDS.INITIALIZE);
      
      return true;
    } catch (error) {
      console.error('Error connecting to USB printer:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Print receipt using browser's print functionality
   * @param {Object} receipt - Receipt data
   * @returns {Promise<boolean>} Print success
   */
  async printReceipt(receipt) {
    if (!receipt) {
      throw new Error('Receipt data is required');
    }
    
    try {
      // Try USB printer first if connected
      if (this.connected && this.usbDevice) {
        return await this.printToUSB(receipt);
      }
      
      // Fall back to browser printing
      const receiptHTML = this.generateReceiptHTML(receipt);
      
      // Create a printable document
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for this website.');
      }
      
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Wait for resources to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Print and close the window
      printWindow.print();
      printWindow.close();
      
      return true;
    } catch (error) {
      console.error('Error printing receipt:', error);
      throw error;
    }
  }

  /**
   * Print receipt to USB printer
   * @param {Object} receipt - Receipt data
   * @returns {Promise<boolean>} Print success
   */
  async printToUSB(receipt) {
    if (!this.connected || !this.usbDevice) {
      throw new Error('Printer not connected. Please connect a printer first.');
    }
    
    try {
      const commands = this.generateESCPOSCommands(receipt);
      
      // Send commands to the printer
      await this.sendCommand(commands);
      
      return true;
    } catch (error) {
      console.error('Error sending print data to USB printer:', error);
      throw error;
    }
  }

  /**
   * Send command to USB printer
   * @param {Array|Uint8Array} command - Command bytes
   * @returns {Promise<USBOutTransferResult>} Transfer result
   */
  async sendCommand(command) {
    if (!this.connected || !this.usbDevice) {
      throw new Error('Printer not connected');
    }
    
    const data = command instanceof Uint8Array ? command : new Uint8Array(command);
    return await this.usbDevice.transferOut(1, data);
  }

  /**
   * Generate HTML for receipt printing
   * @param {Object} receipt - Receipt data
   * @returns {string} HTML content
   */
  generateReceiptHTML(receipt) {
    const { storeName, address, orderNumber, date, items, subtotal, tax, total, paymentMethod, cashier, customer, change } = receipt;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${orderNumber}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Courier New', monospace;
            width: 300px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
          }
          .header, .footer {
            text-align: center;
            margin-bottom: 10px;
          }
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            width: 100%;
          }
          .item-name {
            flex: 2;
          }
          .item-price, .item-qty, .item-total {
            flex: 1;
            text-align: right;
          }
          .totals {
            margin-top: 10px;
            text-align: right;
          }
          .customer-info {
            margin: 10px 0;
          }
          .bold {
            font-weight: bold;
          }
          .text-center {
            text-align: center;
          }
          @media print {
            body {
              width: 100%;
              margin: 0;
              padding: 0;
            }
            @page {
              margin: 0;
              size: 80mm auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2 style="margin: 5px 0;">${storeName}</h2>
          <p style="margin: 5px 0;">${address}</p>
        </div>
        
        <div class="text-center">
          <p style="margin: 5px 0;">Hóa đơn: #${orderNumber}</p>
          <p style="margin: 5px 0;">Ngày: ${date}</p>
          <p style="margin: 5px 0;">Thu ngân: ${cashier}</p>
        </div>
        
        ${customer ? `
        <div class="customer-info">
          <p style="margin: 3px 0;">Khách hàng: ${customer.name}</p>
          ${customer.phone ? `<p style="margin: 3px 0;">SĐT: ${customer.phone}</p>` : ''}
        </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <div>
          <div class="item">
            <div class="item-name bold">Sản phẩm</div>
            <div class="item-qty bold">SL</div>
            <div class="item-price bold">Đơn giá</div>
            <div class="item-total bold">T.Tiền</div>
          </div>
          
          ${items.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-qty">${item.quantity}</div>
              <div class="item-price">${item.price.toLocaleString()}</div>
              <div class="item-total">${item.subtotal.toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="divider"></div>
        
        <div class="totals">
          <p style="margin: 5px 0;">Tạm tính: ${subtotal.toLocaleString()} đ</p>
          <p style="margin: 5px 0;">Thuế: ${tax.toLocaleString()} đ</p>
          <p style="margin: 5px 0;"><strong>Tổng cộng: ${total.toLocaleString()} đ</strong></p>
          <p style="margin: 5px 0;">Thanh toán: ${paymentMethod}</p>
          ${change !== undefined ? `<p style="margin: 5px 0;">Tiền thừa: ${change.toLocaleString()} đ</p>` : ''}
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <p style="margin: 5px 0;">Cảm ơn quý khách đã mua hàng!</p>
          <p style="margin: 5px 0;">Hẹn gặp lại quý khách.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate ESC/POS commands for receipt printer
   * @param {Object} receipt - Receipt data
   * @returns {Uint8Array} Printer commands
   */
  generateESCPOSCommands(receipt) {
    const { storeName, address, orderNumber, date, items, subtotal, tax, total, paymentMethod, cashier, customer, change } = receipt;
    
    // Create command array
    let commands = [];
    
    // Initialize printer
    commands.push(...COMMANDS.INITIALIZE);
    
    // Store name - centered, emphasized
    commands.push(...COMMANDS.ALIGN_CENTER);
    commands.push(...COMMANDS.EMPHASIZE_ON);
    commands.push(...COMMANDS.DOUBLE_HEIGHT_ON);
    commands.push(...this.textToBytes(storeName));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...COMMANDS.DOUBLE_HEIGHT_OFF);
    commands.push(...COMMANDS.EMPHASIZE_OFF);
    
    // Store address
    commands.push(...this.textToBytes(address));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...COMMANDS.LINE_FEED);
    
    // Order details
    commands.push(...this.textToBytes(`Hóa đơn: #${orderNumber}`));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...this.textToBytes(`Ngày: ${date}`));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...this.textToBytes(`Thu ngân: ${cashier}`));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...COMMANDS.LINE_FEED);
    
    // Customer info if available
    if (customer) {
      commands.push(...COMMANDS.ALIGN_LEFT);
      commands.push(...this.textToBytes(`Khách hàng: ${customer.name}`));
      commands.push(...COMMANDS.LINE_FEED);
      if (customer.phone) {
        commands.push(...this.textToBytes(`SĐT: ${customer.phone}`));
        commands.push(...COMMANDS.LINE_FEED);
      }
      commands.push(...COMMANDS.LINE_FEED);
    }
    
    // Divider
    commands.push(...COMMANDS.ALIGN_CENTER);
    commands.push(...this.textToBytes('--------------------------------'));
    commands.push(...COMMANDS.LINE_FEED);
    
    // Item headers
    commands.push(...COMMANDS.ALIGN_LEFT);
    commands.push(...COMMANDS.EMPHASIZE_ON);
    commands.push(...this.textToBytes(
      this.padRight('Sản phẩm', 20) +
      this.padLeft('SL', 3) +
      this.padLeft('Đơn giá', 10) +
      this.padLeft('T.Tiền', 10)
    ));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...COMMANDS.EMPHASIZE_OFF);
    
    // Items
    items.forEach(item => {
      commands.push(...this.textToBytes(
        this.padRight(this.truncate(item.name, 20), 20) +
        this.padLeft(item.quantity.toString(), 3) +
        this.padLeft(this.formatNumber(item.price), 10) +
        this.padLeft(this.formatNumber(item.subtotal), 10)
      ));
      commands.push(...COMMANDS.LINE_FEED);
    });
    
    // Divider
    commands.push(...COMMANDS.ALIGN_CENTER);
    commands.push(...this.textToBytes('--------------------------------'));
    commands.push(...COMMANDS.LINE_FEED);
    
    // Totals - right aligned
    commands.push(...COMMANDS.ALIGN_RIGHT);
    commands.push(...this.textToBytes(`Tạm tính: ${this.formatNumber(subtotal)} đ`));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...this.textToBytes(`Thuế: ${this.formatNumber(tax)} đ`));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...COMMANDS.EMPHASIZE_ON);
    commands.push(...this.textToBytes(`Tổng cộng: ${this.formatNumber(total)} đ`));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...COMMANDS.EMPHASIZE_OFF);
    commands.push(...this.textToBytes(`Thanh toán: ${paymentMethod}`));
    commands.push(...COMMANDS.LINE_FEED);
    
    if (change !== undefined) {
      commands.push(...this.textToBytes(`Tiền thừa: ${this.formatNumber(change)} đ`));
      commands.push(...COMMANDS.LINE_FEED);
    }
    
    // Footer
    commands.push(...COMMANDS.ALIGN_CENTER);
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...this.textToBytes('Cảm ơn quý khách đã mua hàng!'));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...this.textToBytes('Hẹn gặp lại quý khách.'));
    commands.push(...COMMANDS.LINE_FEED);
    commands.push(...COMMANDS.LINE_FEED);
    
    // Cut paper
    commands.push(...COMMANDS.CUT_PAPER);
    
    return new Uint8Array(commands);
  }

  /**
   * Convert text to byte array
   * @param {string} text - Text to convert
   * @returns {Uint8Array} Byte array
   */
  textToBytes(text) {
    return Array.from(this.encoder.encode(text));
  }

  /**
   * Pad string on the right with spaces
   * @param {string} text - Text to pad
   * @param {number} length - Desired length
   * @returns {string} Padded string
   */
  padRight(text, length) {
    return text.toString().padEnd(length, ' ');
  }

  /**
   * Pad string on the left with spaces
   * @param {string} text - Text to pad
   * @param {number} length - Desired length
   * @returns {string} Padded string
   */
  padLeft(text, length) {
    return text.toString().padStart(length, ' ');
  }

  /**
   * Truncate string if too long
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated string
   */
  truncate(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }

  /**
   * Format number with thousands separator
   * @param {number} number - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(number) {
    return number.toLocaleString('vi-VN');
  }

  /**
   * Get printer status
   * @returns {Promise<Object>} Printer status
   */
  async getStatus() {
    if (!this.connected || !this.usbDevice) {
      return {
        connected: false,
        status: 'disconnected',
        printerName: null
      };
    }
    
    try {
      // Send status request command
      await this.sendCommand([DLE, EOT, 1]);
      
      // In a real implementation, we would read the response
      // For now, just return connected status
      return {
        connected: true,
        status: 'ready',
        printerName: this.printerName
      };
    } catch (error) {
      console.error('Error getting printer status:', error);
      return {
        connected: this.connected,
        status: 'error',
        printerName: this.printerName,
        error: error.message
      };
    }
  }

  /**
   * Disconnect from printer
   * @returns {Promise<boolean>} Success
   */
  async disconnect() {
    if (this.usbDevice) {
      try {
        await this.usbDevice.close();
        this.connected = false;
        this.usbDevice = null;
        this.printerName = null;
        return true;
      } catch (error) {
        console.error('Error disconnecting from printer:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Print test page
   * @returns {Promise<boolean>} Success
   */
  async printTestPage() {
    const testReceipt = {
      storeName: 'Trường Phát Computer',
      address: '123 Lê Lợi, Hòa Bình',
      orderNumber: 'TEST-123',
      date: new Date().toLocaleString('vi-VN'),
      cashier: 'Test User',
      items: [
        { name: 'Test Product 1', quantity: 1, price: 100000, subtotal: 100000 },
        { name: 'Test Product 2', quantity: 2, price: 200000, subtotal: 400000 }
      ],
      subtotal: 500000,
      tax: 50000,
      total: 550000,
      paymentMethod: 'Tiền mặt',
      change: 0
    };
    
    return await this.printReceipt(testReceipt);
  }
}

// Create and export singleton instance
const printerService = new PrinterService();
export default printerService; 