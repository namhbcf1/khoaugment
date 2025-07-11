/**
 * Payment Terminal Service
 * This is a mock implementation that simulates payment terminal functionality
 * In a real application, this would interface with actual payment hardware
 */

class PaymentTerminal {
  constructor() {
    this.connected = false;
    this.inTransaction = false;
    this.terminals = [
      { id: 'terminal1', name: 'VNPAY POS', status: 'ready', default: true },
      { id: 'terminal2', name: 'MPOS', status: 'ready', default: false },
      { id: 'terminal3', name: 'SumUp', status: 'offline', default: false },
    ];
    this.selectedTerminal = this.terminals[0];
    this.supportedMethods = ['visa', 'mastercard', 'jcb', 'napas', 'qrcode', 'momo', 'zalopay', 'vnpay'];
  }

  /**
   * Connect to the payment terminal
   * @returns {Promise} A promise that resolves when connected
   */
  connect() {
    return new Promise((resolve) => {
      console.log(`Connecting to payment terminal: ${this.selectedTerminal.name}`);
      
      // Simulate connection delay
      setTimeout(() => {
        this.connected = true;
        console.log(`Payment terminal ${this.selectedTerminal.name} connected successfully`);
        resolve(true);
      }, 1200);
    });
  }

  /**
   * Disconnect from the payment terminal
   * @returns {Promise} A promise that resolves when disconnected
   */
  disconnect() {
    return new Promise((resolve) => {
      if (!this.connected) {
        resolve(false);
        return;
      }
      
      console.log(`Disconnecting from payment terminal: ${this.selectedTerminal.name}`);
      
      // Simulate disconnection delay
      setTimeout(() => {
        this.connected = false;
        console.log(`Payment terminal ${this.selectedTerminal.name} disconnected`);
        resolve(true);
      }, 500);
    });
  }

  /**
   * Select a terminal by ID
   * @param {string} terminalId - The terminal ID to select
   * @returns {object|null} The selected terminal or null if not found
   */
  selectTerminal(terminalId) {
    const terminal = this.terminals.find(t => t.id === terminalId);
    if (terminal) {
      this.selectedTerminal = terminal;
      console.log(`Selected terminal: ${terminal.name}`);
      return terminal;
    }
    return null;
  }

  /**
   * Get available terminals
   * @returns {Array} The available terminals
   */
  getAvailableTerminals() {
    return this.terminals;
  }

  /**
   * Get supported payment methods
   * @returns {Array} The supported payment methods
   */
  getSupportedMethods() {
    return this.supportedMethods;
  }

  /**
   * Process a payment
   * @param {object} options - Payment options
   * @param {number} options.amount - The payment amount
   * @param {string} options.method - The payment method
   * @param {string} options.reference - Reference number for the payment
   * @returns {Promise} A promise that resolves with the payment result
   */
  processPayment(options = {}) {
    const { amount, method = 'card', reference = `REF-${Date.now()}` } = options;
    
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        this.connect()
          .then(() => this._doProcessPayment(amount, method, reference))
          .then(resolve)
          .catch(reject);
        return;
      }
      
      this._doProcessPayment(amount, method, reference)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Internal method to process the payment
   * @param {number} amount - The amount to charge
   * @param {string} method - The payment method
   * @param {string} reference - The payment reference
   * @returns {Promise} A promise that resolves with the payment result
   * @private
   */
  _doProcessPayment(amount, method, reference) {
    return new Promise((resolve, reject) => {
      if (this.inTransaction) {
        reject(new Error('Terminal is already processing a transaction'));
        return;
      }

      if (!amount || amount <= 0) {
        reject(new Error('Invalid payment amount'));
        return;
      }
      
      this.inTransaction = true;
      console.log(`Processing ${method} payment of ${amount} VND (Ref: ${reference})...`);
      
      // Simulate transaction processing
      setTimeout(() => {
        this.inTransaction = false;
        
        // Simulate 95% success rate
        if (Math.random() > 0.05) {
          const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          console.log(`Payment processed successfully: ${transactionId}`);
          
          resolve({
            success: true,
            transactionId,
            timestamp: new Date().toISOString(),
            amount,
            method,
            reference,
            terminal: this.selectedTerminal.id,
            authCode: Math.floor(Math.random() * 900000) + 100000,
          });
        } else {
          // Simulate random errors
          const errors = [
            'Declined by bank',
            'Insufficient funds',
            'Card expired',
            'Connection timeout',
            'Terminal error'
          ];
          const error = errors[Math.floor(Math.random() * errors.length)];
          console.error(`Payment failed: ${error}`);
          
          reject({
            success: false,
            error,
            timestamp: new Date().toISOString(),
            amount,
            method,
            reference,
          });
        }
      }, 3000); // Simulate typical payment processing time
    });
  }

  /**
   * Cancel the current transaction
   * @returns {Promise} A promise that resolves when the transaction is cancelled
   */
  cancelTransaction() {
    return new Promise((resolve) => {
      if (!this.inTransaction) {
        resolve({ success: true, message: 'No active transaction to cancel' });
        return;
      }
      
      console.log('Cancelling current transaction...');
      
      // Simulate cancellation delay
      setTimeout(() => {
        this.inTransaction = false;
        console.log('Transaction cancelled successfully');
        
        resolve({
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Transaction cancelled successfully',
        });
      }, 1000);
    });
  }
}

// Export a singleton instance
const paymentTerminal = new PaymentTerminal();
export default paymentTerminal; 