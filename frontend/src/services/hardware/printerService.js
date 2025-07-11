/**
 * Printer Service
 * This is a mock implementation that simulates printing functionality
 * In a real application, this would interface with actual printer hardware
 */

class PrinterService {
  constructor() {
    this.connected = false;
    this.printers = [
      { id: 'thermal1', name: 'EPSON TM-T82 (Thermal)', type: 'thermal', status: 'ready', default: true },
      { id: 'thermal2', name: 'XPRINTER XP-58 (Thermal)', type: 'thermal', status: 'ready', default: false },
      { id: 'laser1', name: 'HP LaserJet Pro', type: 'laser', status: 'ready', default: false },
    ];
    this.selectedPrinter = this.printers[0];
  }

  /**
   * Get available printers
   * @returns {Array} List of available printers
   */
  getAvailablePrinters() {
    return this.printers;
  }

  /**
   * Select printer by ID
   * @param {string} printerId - The ID of the printer to select
   * @returns {object|null} The selected printer or null if not found
   */
  selectPrinter(printerId) {
    const printer = this.printers.find(p => p.id === printerId);
    if (printer) {
      this.selectedPrinter = printer;
      console.log(`Selected printer: ${printer.name}`);
      return printer;
    }
    return null;
  }

  /**
   * Get the currently selected printer
   * @returns {object} The selected printer
   */
  getSelectedPrinter() {
    return this.selectedPrinter;
  }

  /**
   * Connect to the selected printer
   * @returns {Promise} A promise that resolves when the printer is connected
   */
  connect() {
    return new Promise((resolve) => {
      console.log(`Connecting to printer: ${this.selectedPrinter.name}`);
      
      // Simulate connection delay
      setTimeout(() => {
        this.connected = true;
        console.log(`Printer ${this.selectedPrinter.name} connected successfully`);
        resolve(true);
      }, 800);
    });
  }

  /**
   * Disconnect from the selected printer
   * @returns {Promise} A promise that resolves when the printer is disconnected
   */
  disconnect() {
    return new Promise((resolve) => {
      if (!this.connected) {
        resolve(false);
        return;
      }
      
      console.log(`Disconnecting from printer: ${this.selectedPrinter.name}`);
      
      // Simulate disconnection delay
      setTimeout(() => {
        this.connected = false;
        console.log(`Printer ${this.selectedPrinter.name} disconnected`);
        resolve(true);
      }, 500);
    });
  }

  /**
   * Print content - in a real implementation, this would send data to a physical printer
   * @param {object} options - Print options
   * @param {string} options.content - The content to print (HTML for browser printing)
   * @param {string} options.type - The type of content (receipt, invoice, etc.)
   * @returns {Promise} A promise that resolves when printing is complete
   */
  print(options = {}) {
    return new Promise((resolve, reject) => {
      const { content, type = 'receipt' } = options;
      
      if (!this.connected) {
        this.connect()
          .then(() => this._doPrint(content, type))
          .then(resolve)
          .catch(reject);
        return;
      }
      
      this._doPrint(content, type)
        .then(resolve)
        .catch(reject);
    });
  }
  
  /**
   * Internal method to simulate printing process
   * @param {string} content - Content to print
   * @param {string} type - Type of document
   * @returns {Promise} A promise that resolves when printing is complete
   * @private
   */
  _doPrint(content, type) {
    return new Promise((resolve, reject) => {
      if (!content) {
        reject(new Error('No content to print'));
        return;
      }
      
      console.log(`Printing ${type} on ${this.selectedPrinter.name}...`);
      
      // Simulate print time
      setTimeout(() => {
        // 90% success rate
        if (Math.random() > 0.1) {
          console.log(`Print job completed successfully on ${this.selectedPrinter.name}`);
          resolve({
            success: true,
            printerId: this.selectedPrinter.id,
            timestamp: new Date().toISOString(),
          });
        } else {
          // Simulate random errors
          const errors = [
            'Paper jam',
            'Out of paper',
            'Low ink',
            'Connection lost',
            'Printer busy'
          ];
          const error = errors[Math.floor(Math.random() * errors.length)];
          console.error(`Print error: ${error}`);
          reject(new Error(`Print failed: ${error}`));
        }
      }, 2000);
    });
  }
  
  /**
   * Check printer status
   * @returns {Promise} A promise that resolves with the printer status
   */
  checkStatus() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const statuses = ['ready', 'ready', 'ready', 'ready', 'low_paper', 'low_ink', 'ready'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const printer = { ...this.selectedPrinter, status: randomStatus };
        this.selectedPrinter = printer;
        
        // Update the printer in the list
        this.printers = this.printers.map(p => 
          p.id === printer.id ? printer : p
        );
        
        resolve(printer);
      }, 500);
    });
  }
}

// Export a singleton instance
const printerService = new PrinterService();
export default printerService; 