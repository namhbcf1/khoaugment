/**
 * Barcode Scanner Service
 * This is a mock implementation that simulates a barcode scanner device
 * In a real application, this would interface with actual hardware
 */

class BarcodeScanner {
  constructor() {
    this.connected = false;
    this.callbacks = [];
    this.mockScannerInterval = null;
    
    // For testing - these could be triggered from a real device
    this.testBarcodes = [
      '8900001', // Laptop Dell
      '8900002', // Chuột không dây
      '8900003', // Bàn phím cơ
      '8900004', // Tai nghe Sony
      '8900005', // Màn hình LG
    ];
  }

  /**
   * Connect to the barcode scanner
   * @returns {boolean} Connection status
   */
  connect() {
    if (this.connected) return true;
    
    console.log('Connecting to barcode scanner...');
    
    // Simulate a connection delay
    setTimeout(() => {
      this.connected = true;
      console.log('Barcode scanner connected successfully');
    }, 500);
    
    return true;
  }

  /**
   * Disconnect from the barcode scanner
   * @returns {boolean} Connection status
   */
  disconnect() {
    if (!this.connected) return false;
    
    console.log('Disconnecting from barcode scanner...');
    this.connected = false;
    
    // Clear any test interval
    if (this.mockScannerInterval) {
      clearInterval(this.mockScannerInterval);
      this.mockScannerInterval = null;
    }
    
    console.log('Barcode scanner disconnected');
    return true;
  }

  /**
   * Register a callback to be called when a barcode is scanned
   * @param {Function} callback - The function to call with the scanned barcode
   * @returns {number} The index of the callback in the callbacks array
   */
  onScan(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    this.callbacks.push(callback);
    return this.callbacks.length - 1;
  }

  /**
   * Remove a callback from the callbacks array
   * @param {number} index - The index of the callback to remove
   * @returns {boolean} Whether the callback was removed
   */
  offScan(index) {
    if (index < 0 || index >= this.callbacks.length) {
      return false;
    }
    
    this.callbacks.splice(index, 1);
    return true;
  }

  /**
   * Trigger a mock scan for testing purposes
   * @param {string} barcode - The barcode to simulate scanning
   */
  mockScan(barcode) {
    if (!this.connected) {
      console.warn('Cannot scan: scanner not connected');
      return;
    }
    
    console.log(`Mock scan: ${barcode}`);
    this.callbacks.forEach(callback => {
      try {
        callback(barcode);
      } catch (error) {
        console.error('Error in barcode scan callback:', error);
      }
    });
  }

  /**
   * Start a demo mode that periodically scans random test barcodes
   * @param {number} interval - Milliseconds between scans
   */
  startDemo(interval = 5000) {
    if (this.mockScannerInterval) {
      clearInterval(this.mockScannerInterval);
    }
    
    this.connect();
    
    this.mockScannerInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.testBarcodes.length);
      this.mockScan(this.testBarcodes[randomIndex]);
    }, interval);
    
    console.log('Demo mode started');
  }

  /**
   * Stop the demo mode
   */
  stopDemo() {
    if (this.mockScannerInterval) {
      clearInterval(this.mockScannerInterval);
      this.mockScannerInterval = null;
      console.log('Demo mode stopped');
    }
  }
}

// Export a singleton instance
const barcodeScanner = new BarcodeScanner();
export default barcodeScanner; 