/**
 * Hardware Integration Service
 * Handles integration with POS hardware devices
 */

import { message } from 'antd';

class HardwareIntegrationService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://khoaugment-api.bangachieu2.workers.dev';
    this.supportedDevices = [
      'thermal_printer', 'barcode_scanner', 'cash_drawer', 
      'payment_terminal', 'customer_display', 'scale'
    ];
    this.connectedDevices = new Map();
  }

  // Thermal Printer Integration
  async connectThermalPrinter(config) {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/printer/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: 'thermal',
          port: config.port,
          baudRate: config.baudRate || 9600,
          paperWidth: config.paperWidth || 80,
          characterSet: config.characterSet || 'UTF-8'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.connectedDevices.set('thermal_printer', config);
        message.success('Thermal printer connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Printer connection failed: ${error.message}`);
      throw error;
    }
  }

  async printReceipt(receiptData) {
    try {
      if (!this.connectedDevices.has('thermal_printer')) {
        throw new Error('Thermal printer not connected');
      }

      const response = await fetch(`${this.baseURL}/api/hardware/printer/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(receiptData)
      });

      const result = await response.json();
      if (result.success) {
        message.success('Receipt printed successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Print failed: ${error.message}`);
      throw error;
    }
  }

  // Barcode Scanner Integration
  async connectBarcodeScanner(config) {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/scanner/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: config.type || 'usb_hid',
          port: config.port,
          autoScan: config.autoScan || true,
          scanMode: config.scanMode || 'continuous'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.connectedDevices.set('barcode_scanner', config);
        message.success('Barcode scanner connected successfully!');
        this.startScannerListener();
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Scanner connection failed: ${error.message}`);
      throw error;
    }
  }

  startScannerListener() {
    // Simulate barcode scanning events
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleBarcodeInput.bind(this));
    }
  }

  handleBarcodeInput(event) {
    // Simple barcode detection logic
    if (event.key === 'Enter' && this.barcodeBuffer) {
      const barcode = this.barcodeBuffer;
      this.barcodeBuffer = '';
      this.onBarcodeScanned(barcode);
    } else if (event.key.length === 1) {
      this.barcodeBuffer = (this.barcodeBuffer || '') + event.key;
    }
  }

  onBarcodeScanned(barcode) {
    // Emit barcode scanned event
    const event = new CustomEvent('barcodeScanned', { detail: { barcode } });
    window.dispatchEvent(event);
  }

  // Cash Drawer Integration
  async connectCashDrawer(config) {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/cashdrawer/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: config.type || 'rj11',
          port: config.port,
          kickCode: config.kickCode || '1B7000'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.connectedDevices.set('cash_drawer', config);
        message.success('Cash drawer connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Cash drawer connection failed: ${error.message}`);
      throw error;
    }
  }

  async openCashDrawer() {
    try {
      if (!this.connectedDevices.has('cash_drawer')) {
        throw new Error('Cash drawer not connected');
      }

      const response = await fetch(`${this.baseURL}/api/hardware/cashdrawer/open`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        message.success('Cash drawer opened!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Failed to open cash drawer: ${error.message}`);
      throw error;
    }
  }

  // Payment Terminal Integration
  async connectPaymentTerminal(config) {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/payment/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: config.type,
          port: config.port,
          merchantId: config.merchantId,
          terminalId: config.terminalId
        })
      });

      const result = await response.json();
      if (result.success) {
        this.connectedDevices.set('payment_terminal', config);
        message.success('Payment terminal connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Payment terminal connection failed: ${error.message}`);
      throw error;
    }
  }

  async processCardPayment(amount, transactionType = 'sale') {
    try {
      if (!this.connectedDevices.has('payment_terminal')) {
        throw new Error('Payment terminal not connected');
      }

      const response = await fetch(`${this.baseURL}/api/hardware/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          transactionType,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('Card payment processed successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Card payment failed: ${error.message}`);
      throw error;
    }
  }

  // Customer Display Integration
  async connectCustomerDisplay(config) {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/display/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: config.type || 'usb',
          port: config.port,
          displaySize: config.displaySize || '20x2'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.connectedDevices.set('customer_display', config);
        message.success('Customer display connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Customer display connection failed: ${error.message}`);
      throw error;
    }
  }

  async updateCustomerDisplay(text) {
    try {
      if (!this.connectedDevices.has('customer_display')) {
        throw new Error('Customer display not connected');
      }

      const response = await fetch(`${this.baseURL}/api/hardware/display/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ text })
      });

      const result = await response.json();
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error(`Display update failed: ${error.message}`);
      throw error;
    }
  }

  // Scale Integration
  async connectScale(config) {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/scale/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: config.type || 'serial',
          port: config.port,
          baudRate: config.baudRate || 9600,
          unit: config.unit || 'kg'
        })
      });

      const result = await response.json();
      if (result.success) {
        this.connectedDevices.set('scale', config);
        message.success('Scale connected successfully!');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Scale connection failed: ${error.message}`);
      throw error;
    }
  }

  async getWeight() {
    try {
      if (!this.connectedDevices.has('scale')) {
        throw new Error('Scale not connected');
      }

      const response = await fetch(`${this.baseURL}/api/hardware/scale/weight`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        return result.weight;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      message.error(`Failed to get weight: ${error.message}`);
      throw error;
    }
  }

  // Device Status
  async getDeviceStatus() {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      return result.data || {};
    } catch (error) {
      console.error('Failed to get device status:', error);
      return {};
    }
  }

  // Disconnect Device
  async disconnectDevice(deviceType) {
    try {
      const response = await fetch(`${this.baseURL}/api/hardware/${deviceType}/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        this.connectedDevices.delete(deviceType);
        message.success(`${deviceType} disconnected successfully`);
        return result;
      }
    } catch (error) {
      message.error(`Failed to disconnect ${deviceType}: ${error.message}`);
      throw error;
    }
  }

  // Get Connected Devices
  getConnectedDevices() {
    return Array.from(this.connectedDevices.keys());
  }

  // Check if device is connected
  isDeviceConnected(deviceType) {
    return this.connectedDevices.has(deviceType);
  }
}

export default new HardwareIntegrationService();
