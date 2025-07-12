/**
 * Payment Terminal Service
 * Integrates with physical payment terminals via WebUSB and other protocols
 * 
 * @author KhoChuan POS
 * @version 1.0.0
 */

import { message } from 'antd';

// Terminal vendor IDs and product IDs for common payment terminals in Vietnam
const SUPPORTED_TERMINALS = {
  VERIFONE: {
    vendorId: 0x11CA,
    productIds: [0x0219, 0x0220, 0x0226], // VX680, VX820, P400
    name: 'Verifone',
    protocols: ['usb', 'bluetooth', 'serial']
  },
  INGENICO: {
    vendorId: 0x079B,
    productIds: [0x0028, 0x0026, 0x0052], // iCT250, iWL250, Desk/5000
    name: 'Ingenico',
    protocols: ['usb', 'ethernet', 'serial']
  },
  PAX: {
    vendorId: 0x2FB8,
    productIds: [0x0001, 0x0002, 0x0003], // S80, S90, A80
    name: 'PAX',
    protocols: ['usb', 'bluetooth', 'wifi']
  },
  SUNMI: {
    vendorId: 0x2C97,
    productIds: [0x0001, 0x0002], // P1, P2
    name: 'Sunmi',
    protocols: ['usb', 'bluetooth']
  },
  VNPAY: {
    vendorId: 0x2D88,
    productIds: [0x0001], // VNPAY POS
    name: 'VNPAY',
    protocols: ['usb', 'bluetooth']
  }
};

// Payment status constants
export const PAYMENT_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  PROCESSING: 'processing',
  APPROVED: 'approved',
  DECLINED: 'declined',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout'
};

// Payment method constants
export const PAYMENT_METHODS = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  EMV: 'emv',
  CONTACTLESS: 'contactless',
  QR: 'qr',
  WALLET: 'wallet',
  GIFT: 'gift'
};

class PaymentTerminalService {
  constructor() {
    this.device = null;
    this.interface = null;
    this.endpointIn = null;
    this.endpointOut = null;
    this.connected = false;
    this.status = PAYMENT_STATUS.IDLE;
    this.terminalInfo = null;
    this.transactionListeners = [];
    this.connectionListeners = [];
    this.lastTransactionData = null;
    this.supportedTerminals = SUPPORTED_TERMINALS;
  }

  /**
   * Initialize the service and check for WebUSB support
   * @returns {boolean} Whether WebUSB is supported
   */
  initialize() {
    if (navigator.usb) {
      this.checkForConnectedDevices();
      navigator.usb.addEventListener('connect', this.handleDeviceConnect.bind(this));
      navigator.usb.addEventListener('disconnect', this.handleDeviceDisconnect.bind(this));
      return true;
    } else {
      console.error('WebUSB is not supported in this browser');
      return false;
    }
  }

  /**
   * Check for already connected payment terminals
   */
  async checkForConnectedDevices() {
    try {
      const devices = await navigator.usb.getDevices();
      for (const device of devices) {
        if (this.isPaymentTerminal(device)) {
          await this.connectToDevice(device);
          break;
        }
      }
    } catch (error) {
      console.error('Error checking for connected devices:', error);
    }
  }

  /**
   * Request a payment terminal connection
   * @returns {Promise<boolean>} Whether connection was successful
   */
  async requestDevice() {
    try {
      this.status = PAYMENT_STATUS.CONNECTING;
      this.notifyConnectionListeners();

      // Create filters for all supported terminals
      const filters = [];
      Object.values(SUPPORTED_TERMINALS).forEach(terminal => {
        terminal.productIds.forEach(productId => {
          filters.push({
            vendorId: terminal.vendorId,
            productId: productId
          });
        });
      });

      const device = await navigator.usb.requestDevice({ filters });
      
      if (this.isPaymentTerminal(device)) {
        await this.connectToDevice(device);
        return true;
      } else {
        this.status = PAYMENT_STATUS.ERROR;
        this.notifyConnectionListeners();
        message.error('Selected device is not a supported payment terminal');
        return false;
      }
    } catch (error) {
      this.status = PAYMENT_STATUS.ERROR;
      this.notifyConnectionListeners();
      
      // Don't show error if user simply canceled the selection dialog
      if (error.name !== 'NotFoundError') {
        console.error('Error requesting payment terminal:', error);
        message.error(`Failed to connect to payment terminal: ${error.message}`);
      }
      return false;
    }
  }

  /**
   * Connect to a payment terminal device
   * @param {USBDevice} device - USB device to connect to
   * @returns {Promise<boolean>} Whether connection was successful
   */
  async connectToDevice(device) {
    try {
      this.device = device;
      this.status = PAYMENT_STATUS.CONNECTING;
      this.notifyConnectionListeners();

      await this.device.open();
      
      // Try to determine terminal type
      this.terminalInfo = this.identifyTerminal(device);
      
      // Select configuration
      if (this.device.configuration === null) {
        await this.device.selectConfiguration(1);
      }

      // Find the interface with class 0xFF (vendor-specific)
      const interfaceNumber = this.device.configurations[0].interfaces.findIndex(
        intf => intf.alternates[0].interfaceClass === 0xFF
      );

      if (interfaceNumber === -1) {
        throw new Error('No suitable interface found on the device');
      }

      this.interface = this.device.configurations[0].interfaces[interfaceNumber];
      await this.device.claimInterface(interfaceNumber);

      // Find bulk endpoints
      const alternate = this.interface.alternates[0];
      this.endpointIn = alternate.endpoints.find(ep => ep.direction === 'in' && ep.type === 'bulk')?.endpointNumber;
      this.endpointOut = alternate.endpoints.find(ep => ep.direction === 'out' && ep.type === 'bulk')?.endpointNumber;

      if (!this.endpointIn || !this.endpointOut) {
        throw new Error('Required endpoints not found on the device');
      }

      this.connected = true;
      this.status = PAYMENT_STATUS.IDLE;
      this.notifyConnectionListeners();
      
      message.success(`Connected to ${this.terminalInfo?.name || 'payment terminal'}`);
      
      // Start listening for messages from the terminal
      this.startListening();
      
      return true;
    } catch (error) {
      this.connected = false;
      this.status = PAYMENT_STATUS.ERROR;
      this.notifyConnectionListeners();
      console.error('Error connecting to payment terminal:', error);
      message.error(`Failed to connect to payment terminal: ${error.message}`);
      return false;
    }
  }

  /**
   * Disconnect from the payment terminal
   * @returns {Promise<boolean>} Whether disconnection was successful
   */
  async disconnect() {
    if (!this.device || !this.connected) {
      return true;
    }

    try {
      await this.device.releaseInterface(this.interface.interfaceNumber);
      await this.device.close();
      
      this.device = null;
      this.interface = null;
      this.endpointIn = null;
      this.endpointOut = null;
      this.connected = false;
      this.status = PAYMENT_STATUS.IDLE;
      this.notifyConnectionListeners();
      
      message.success('Disconnected from payment terminal');
      return true;
    } catch (error) {
      console.error('Error disconnecting from payment terminal:', error);
      message.error(`Failed to disconnect from payment terminal: ${error.message}`);
      return false;
    }
  }

  /**
   * Process a payment transaction
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.amount - Amount in VND
   * @param {string} paymentData.method - Payment method
   * @param {string} paymentData.reference - Reference number (e.g., order ID)
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(paymentData) {
    if (!this.connected || !this.device) {
      throw new Error('Not connected to payment terminal');
    }

    try {
      this.status = PAYMENT_STATUS.PROCESSING;
      this.notifyTransactionListeners();
      
      // Format amount for terminal (amount in VND)
      const formattedAmount = Math.round(paymentData.amount * 100).toString().padStart(12, '0');
      
      // Create payment command based on terminal type
      let command;
      
      if (this.terminalInfo?.name === 'Verifone') {
        command = this.createVerifoneCommand(formattedAmount, paymentData);
      } else if (this.terminalInfo?.name === 'Ingenico') {
        command = this.createIngenicoCommand(formattedAmount, paymentData);
      } else if (this.terminalInfo?.name === 'PAX') {
        command = this.createPaxCommand(formattedAmount, paymentData);
      } else if (this.terminalInfo?.name === 'Sunmi') {
        command = this.createSunmiCommand(formattedAmount, paymentData);
      } else if (this.terminalInfo?.name === 'VNPAY') {
        command = this.createVNPayCommand(formattedAmount, paymentData);
      } else {
        // Generic command format as fallback
        command = this.createGenericCommand(formattedAmount, paymentData);
      }
      
      // Send command to terminal
      await this.sendCommand(command);
      
      // Wait for response (implementation depends on terminal)
      const response = await this.waitForResponse(60000); // 60 second timeout
      
      // Process response
      const result = this.processResponse(response);
      
      this.lastTransactionData = {
        ...result,
        amount: paymentData.amount,
        reference: paymentData.reference,
        timestamp: new Date().toISOString()
      };
      
      this.status = result.approved ? PAYMENT_STATUS.APPROVED : PAYMENT_STATUS.DECLINED;
      this.notifyTransactionListeners();
      
      return this.lastTransactionData;
    } catch (error) {
      this.status = PAYMENT_STATUS.ERROR;
      this.notifyTransactionListeners();
      console.error('Payment processing error:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  /**
   * Cancel the current transaction
   * @returns {Promise<boolean>} Whether cancellation was successful
   */
  async cancelTransaction() {
    if (!this.connected || !this.device) {
      return false;
    }

    if (this.status !== PAYMENT_STATUS.PROCESSING) {
      return false;
    }

    try {
      // Create cancel command based on terminal type
      let command;
      
      if (this.terminalInfo?.name === 'Verifone') {
        command = new Uint8Array([0x02, 0x43, 0x41, 0x4E, 0x03]); // STX + "CAN" + ETX
      } else if (this.terminalInfo?.name === 'Ingenico') {
        command = new Uint8Array([0x02, 0x43, 0x41, 0x4E, 0x43, 0x45, 0x4C, 0x03]); // STX + "CANCEL" + ETX
      } else {
        // Generic cancel command as fallback
        command = new Uint8Array([0x18]); // CAN (Cancel) character
      }
      
      await this.sendCommand(command);
      
      this.status = PAYMENT_STATUS.CANCELLED;
      this.notifyTransactionListeners();
      
      return true;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      return false;
    }
  }

  /**
   * Get the last transaction data
   * @returns {Object|null} Last transaction data or null if none
   */
  getLastTransaction() {
    return this.lastTransactionData;
  }

  /**
   * Add a transaction listener
   * @param {Function} listener - Listener function
   */
  addTransactionListener(listener) {
    if (typeof listener === 'function' && !this.transactionListeners.includes(listener)) {
      this.transactionListeners.push(listener);
    }
  }

  /**
   * Remove a transaction listener
   * @param {Function} listener - Listener function to remove
   */
  removeTransactionListener(listener) {
    const index = this.transactionListeners.indexOf(listener);
    if (index !== -1) {
      this.transactionListeners.splice(index, 1);
    }
  }

  /**
   * Add a connection listener
   * @param {Function} listener - Listener function
   */
  addConnectionListener(listener) {
    if (typeof listener === 'function' && !this.connectionListeners.includes(listener)) {
      this.connectionListeners.push(listener);
    }
  }

  /**
   * Remove a connection listener
   * @param {Function} listener - Listener function to remove
   */
  removeConnectionListener(listener) {
    const index = this.connectionListeners.indexOf(listener);
    if (index !== -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  /**
   * Notify all transaction listeners
   * @private
   */
  notifyTransactionListeners() {
    const data = {
      status: this.status,
      transaction: this.lastTransactionData
    };
    
    this.transactionListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in transaction listener:', error);
      }
    });
  }

  /**
   * Notify all connection listeners
   * @private
   */
  notifyConnectionListeners() {
    const data = {
      connected: this.connected,
      status: this.status,
      terminalInfo: this.terminalInfo
    };
    
    this.connectionListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  /**
   * Check if a device is a supported payment terminal
   * @param {USBDevice} device - USB device to check
   * @returns {boolean} Whether the device is a supported payment terminal
   * @private
   */
  isPaymentTerminal(device) {
    return Object.values(SUPPORTED_TERMINALS).some(terminal => {
      return terminal.vendorId === device.vendorId && 
             terminal.productIds.includes(device.productId);
    });
  }

  /**
   * Identify terminal type based on vendor and product IDs
   * @param {USBDevice} device - USB device to identify
   * @returns {Object|null} Terminal info or null if not identified
   * @private
   */
  identifyTerminal(device) {
    for (const [key, terminal] of Object.entries(SUPPORTED_TERMINALS)) {
      if (terminal.vendorId === device.vendorId && 
          terminal.productIds.includes(device.productId)) {
        return {
          type: key,
          name: terminal.name,
          protocols: terminal.protocols
        };
      }
    }
    return null;
  }

  /**
   * Handle device connect event
   * @param {USBConnectionEvent} event - Connection event
   * @private
   */
  async handleDeviceConnect(event) {
    if (this.isPaymentTerminal(event.device) && !this.connected) {
      await this.connectToDevice(event.device);
    }
  }

  /**
   * Handle device disconnect event
   * @param {USBConnectionEvent} event - Disconnection event
   * @private
   */
  handleDeviceDisconnect(event) {
    if (this.device && event.device === this.device) {
      this.device = null;
      this.interface = null;
      this.endpointIn = null;
      this.endpointOut = null;
      this.connected = false;
      this.status = PAYMENT_STATUS.IDLE;
      this.notifyConnectionListeners();
      
      message.warning('Payment terminal disconnected');
    }
  }

  /**
   * Start listening for messages from the terminal
   * @private
   */
  async startListening() {
    if (!this.connected || !this.device || !this.endpointIn) {
      return;
    }

    try {
      while (this.connected) {
        const result = await this.device.transferIn(this.endpointIn, 64);
        if (result.data && result.data.byteLength > 0) {
          this.handleIncomingData(result.data);
        }
      }
    } catch (error) {
      if (this.connected) {
        console.error('Error reading from payment terminal:', error);
        this.disconnect();
      }
    }
  }

  /**
   * Handle incoming data from the terminal
   * @param {DataView} data - Incoming data
   * @private
   */
  handleIncomingData(data) {
    // Implementation depends on terminal protocol
    // This is a placeholder
    console.log('Received data from terminal:', new Uint8Array(data.buffer));
  }

  /**
   * Send a command to the terminal
   * @param {Uint8Array} command - Command to send
   * @returns {Promise<void>}
   * @private
   */
  async sendCommand(command) {
    if (!this.connected || !this.device || !this.endpointOut) {
      throw new Error('Not connected to payment terminal');
    }

    try {
      await this.device.transferOut(this.endpointOut, command);
    } catch (error) {
      console.error('Error sending command to payment terminal:', error);
      throw new Error(`Failed to send command: ${error.message}`);
    }
  }

  /**
   * Wait for a response from the terminal
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Response data
   * @private
   */
  async waitForResponse(timeout) {
    return new Promise((resolve, reject) => {
      // This is a placeholder implementation
      // In a real implementation, we would wait for a response from the terminal
      
      // For now, simulate a successful response after a delay
      setTimeout(() => {
        resolve({
          approved: Math.random() > 0.2, // 80% chance of approval
          authCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          cardType: Math.random() > 0.5 ? 'VISA' : 'MASTERCARD',
          cardNumber: '************' + Math.floor(1000 + Math.random() * 9000),
          expiryDate: '12/25',
          transactionId: Date.now().toString()
        });
      }, 2000);
      
      // Set timeout
      setTimeout(() => {
        reject(new Error('Transaction timed out'));
      }, timeout);
    });
  }

  /**
   * Process a response from the terminal
   * @param {Object} response - Response data
   * @returns {Object} Processed response
   * @private
   */
  processResponse(response) {
    // This is a placeholder implementation
    return {
      approved: response.approved,
      authCode: response.authCode,
      cardType: response.cardType,
      cardNumber: response.cardNumber,
      expiryDate: response.expiryDate,
      transactionId: response.transactionId,
      message: response.approved ? 'Transaction approved' : 'Transaction declined',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Create a command for Verifone terminals
   * @param {string} formattedAmount - Formatted amount
   * @param {Object} paymentData - Payment data
   * @returns {Uint8Array} Command data
   * @private
   */
  createVerifoneCommand(formattedAmount, paymentData) {
    // This is a placeholder implementation for Verifone terminals
    const command = `02SALE${formattedAmount}${paymentData.reference.padEnd(24, ' ')}03`;
    return new TextEncoder().encode(command);
  }

  /**
   * Create a command for Ingenico terminals
   * @param {string} formattedAmount - Formatted amount
   * @param {Object} paymentData - Payment data
   * @returns {Uint8Array} Command data
   * @private
   */
  createIngenicoCommand(formattedAmount, paymentData) {
    // This is a placeholder implementation for Ingenico terminals
    const command = `02PURCHASE${formattedAmount}${paymentData.reference.padEnd(24, ' ')}03`;
    return new TextEncoder().encode(command);
  }

  /**
   * Create a command for PAX terminals
   * @param {string} formattedAmount - Formatted amount
   * @param {Object} paymentData - Payment data
   * @returns {Uint8Array} Command data
   * @private
   */
  createPaxCommand(formattedAmount, paymentData) {
    // This is a placeholder implementation for PAX terminals
    const command = `02T00${formattedAmount}${paymentData.reference.padEnd(24, ' ')}03`;
    return new TextEncoder().encode(command);
  }

  /**
   * Create a command for Sunmi terminals
   * @param {string} formattedAmount - Formatted amount
   * @param {Object} paymentData - Payment data
   * @returns {Uint8Array} Command data
   * @private
   */
  createSunmiCommand(formattedAmount, paymentData) {
    // This is a placeholder implementation for Sunmi terminals
    const command = `02PAY${formattedAmount}${paymentData.reference.padEnd(24, ' ')}03`;
    return new TextEncoder().encode(command);
  }

  /**
   * Create a command for VNPAY terminals
   * @param {string} formattedAmount - Formatted amount
   * @param {Object} paymentData - Payment data
   * @returns {Uint8Array} Command data
   * @private
   */
  createVNPayCommand(formattedAmount, paymentData) {
    // This is a placeholder implementation for VNPAY terminals
    const command = `02PAYMENT${formattedAmount}${paymentData.reference.padEnd(24, ' ')}03`;
    return new TextEncoder().encode(command);
  }

  /**
   * Create a generic command for unknown terminals
   * @param {string} formattedAmount - Formatted amount
   * @param {Object} paymentData - Payment data
   * @returns {Uint8Array} Command data
   * @private
   */
  createGenericCommand(formattedAmount, paymentData) {
    // This is a placeholder implementation for generic terminals
    const command = `02CHARGE${formattedAmount}${paymentData.reference.padEnd(24, ' ')}03`;
    return new TextEncoder().encode(command);
  }
}

// Create and export singleton instance
const paymentTerminalService = new PaymentTerminalService();
export default paymentTerminalService; 