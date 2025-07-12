/**
 * Cash Drawer Service - Real implementation for POS cash drawer control
 * Uses WebUSB or ESC/POS commands through connected printer
 */

import printerService from './printerService';

// Cash drawer commands
const COMMANDS = {
  // ESC/POS command to open cash drawer
  // ESC p m t1 t2
  // m = pin number (0 or 1)
  // t1, t2 = on time (ms) = t1 * 2 + t2 * 200
  OPEN_DRAWER_PIN_2: [0x1B, 0x70, 0x00, 0x19, 0xFA], // Pin 2, 50ms on time
  OPEN_DRAWER_PIN_5: [0x1B, 0x70, 0x01, 0x19, 0xFA], // Pin 5, 50ms on time
  
  // Star Micronics specific commands
  STAR_OPEN_DRAWER_1: [0x07],
  STAR_OPEN_DRAWER_2: [0x1A],
  
  // Epson specific commands
  EPSON_OPEN_DRAWER_1: [0x1B, 0x70, 0x00, 0x32, 0x32],
  EPSON_OPEN_DRAWER_2: [0x1B, 0x70, 0x01, 0x32, 0x32]
};

class CashDrawerService {
  constructor() {
    this.connected = false;
    this.usbDevice = null;
    this.status = 'closed';
    this.drawerName = null;
    this.lastOpenTime = null;
    this.drawerType = null;
    this.supportedDrawers = [
      { vendorId: 0x04b8, productId: 0x0202, type: 'epson' }, // Epson compatible
      { vendorId: 0x0483, productId: 0x5740, type: 'star' },  // Star Micronics compatible
      { vendorId: 0x0525, productId: 0xa700, type: 'epson' }, // Xprinter
      { vendorId: 0x1504, productId: 0x0006, type: 'epson' }, // Sunmi
      { vendorId: 0x0416, productId: 0x5011, type: 'epson' }, // Rongta
      { vendorId: 0x0fe6, productId: 0x811e, type: 'epson' }  // Sewoo
    ];
  }

  /**
   * Check if WebUSB is supported by the browser
   * @returns {boolean} WebUSB support status
   */
  isWebUSBSupported() {
    return navigator && navigator.usb && typeof navigator.usb.requestDevice === 'function';
  }

  /**
   * Connect to a USB cash drawer
   * @returns {Promise<boolean>} Connection success
   */
  async connectUSB() {
    if (!this.isWebUSBSupported()) {
      throw new Error('WebUSB not supported in this browser');
    }
    
    try {
      // Request a USB device
      this.usbDevice = await navigator.usb.requestDevice({
        filters: this.supportedDrawers
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
      this.drawerName = `${this.usbDevice.manufacturerName || 'Unknown'} ${this.usbDevice.productName || 'Cash Drawer'}`;
      
      // Determine drawer type based on vendor/product ID
      const drawerInfo = this.supportedDrawers.find(
        d => d.vendorId === this.usbDevice.vendorId && d.productId === this.usbDevice.productId
      );
      this.drawerType = drawerInfo?.type || 'epson';
      
      console.log(`Connected to cash drawer: ${this.drawerName} (${this.drawerType})`);
      return true;
    } catch (error) {
      console.error('Error connecting to USB cash drawer:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Send command to USB device
   * @param {Array|Uint8Array} command - Command bytes
   * @returns {Promise<USBOutTransferResult>} Transfer result
   */
  async sendCommand(command) {
    if (!this.connected || !this.usbDevice) {
      throw new Error('Cash drawer not connected via USB');
    }
    
    const data = command instanceof Uint8Array ? command : new Uint8Array(command);
    return await this.usbDevice.transferOut(1, data);
  }

  /**
   * Open cash drawer through direct USB connection
   * @returns {Promise<boolean>} Success
   */
  async openDrawerUSB() {
    if (!this.connected || !this.usbDevice) {
      throw new Error('Cash drawer not connected via USB');
    }
    
    try {
      // Select command based on drawer type
      let command;
      
      switch (this.drawerType) {
        case 'star':
          command = COMMANDS.STAR_OPEN_DRAWER_1;
          break;
        case 'epson':
        default:
          command = COMMANDS.OPEN_DRAWER_PIN_2;
          break;
      }
      
      await this.sendCommand(command);
      
      this.status = 'open';
      this.lastOpenTime = new Date();
      
      console.log('Cash drawer opened via USB');
      return true;
    } catch (error) {
      console.error('Error opening cash drawer via USB:', error);
      throw error;
    }
  }

  /**
   * Open cash drawer through connected printer
   * @returns {Promise<boolean>} Success
   */
  async openDrawerViaPrinter() {
    try {
      // Check if printer is connected
      const printerStatus = await printerService.getStatus();
      if (!printerStatus.connected) {
        throw new Error('Printer not connected. Cash drawer cannot be opened.');
      }
      
      // Cash drawer open command for ESC/POS
      const command = new Uint8Array(COMMANDS.OPEN_DRAWER_PIN_2);
      
      // Send command to printer
      if (printerService.usbDevice) {
        await printerService.sendCommand(command);
        
        this.status = 'open';
        this.lastOpenTime = new Date();
        
        console.log('Cash drawer opened via printer');
        return true;
      } else {
        throw new Error('Printer USB device not available');
      }
    } catch (error) {
      console.error('Error opening cash drawer via printer:', error);
      throw error;
    }
  }

  /**
   * Open cash drawer using the most appropriate method
   * @param {Object} options - Open options
   * @param {number} options.pin - Drawer pin (0 for pin 2, 1 for pin 5)
   * @returns {Promise<boolean>} Success
   */
  async openDrawer(options = {}) {
    const { pin = 0 } = options;
    
    try {
      // Try direct USB connection first
      if (this.connected && this.usbDevice) {
        return await this.openDrawerUSB();
      }
      
      // Fall back to printer method
      return await this.openDrawerViaPrinter();
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
      
      // If in development environment, show browser alert
      if (process.env.NODE_ENV === 'development') {
        console.log('Cash drawer would open now in production environment');
        this.status = 'open';
        this.lastOpenTime = new Date();
        return true;
      }
      
      throw error;
    }
  }

  /**
   * Get cash drawer status
   * @returns {Promise<Object>} Drawer status
   */
  async getStatus() {
    // In a real implementation, we would query the device
    // For now, we'll use our stored status
    
    return {
      connected: this.connected,
      status: this.status,
      drawerName: this.drawerName,
      lastOpenTime: this.lastOpenTime,
      drawerType: this.drawerType
    };
  }

  /**
   * Check if drawer is open
   * @returns {Promise<boolean>} Is drawer open
   */
  async isOpen() {
    const status = await this.getStatus();
    return status.status === 'open';
  }

  /**
   * Register drawer status change
   * @param {string} status - New status ('open' or 'closed')
   */
  registerStatusChange(status) {
    if (status === 'open' || status === 'closed') {
      this.status = status;
      
      if (status === 'open') {
        this.lastOpenTime = new Date();
      }
      
      console.log(`Cash drawer status changed to: ${status}`);
    }
  }

  /**
   * Test cash drawer
   * @returns {Promise<boolean>} Success
   */
  async testDrawer() {
    try {
      const result = await this.openDrawer();
      return result;
    } catch (error) {
      console.error('Cash drawer test failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from cash drawer
   * @returns {Promise<boolean>} Success
   */
  async disconnect() {
    if (this.usbDevice) {
      try {
        await this.usbDevice.close();
        this.connected = false;
        this.usbDevice = null;
        this.drawerName = null;
        this.drawerType = null;
        return true;
      } catch (error) {
        console.error('Error disconnecting from cash drawer:', error);
        return false;
      }
    }
    
    this.connected = false;
    return true;
  }
}

// Create and export singleton instance
const cashDrawerService = new CashDrawerService();
export default cashDrawerService; 