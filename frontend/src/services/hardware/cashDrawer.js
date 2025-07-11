/**
 * Cash Drawer Service
 * This is a mock implementation that simulates cash drawer functionality
 * In a real application, this would interface with actual cash drawer hardware
 */

class CashDrawer {
  constructor() {
    this.connected = false;
    this.isOpen = false;
    this.cashCount = {
      bills: {
        500000: 0,
        200000: 0,
        100000: 5,
        50000: 10,
        20000: 20,
        10000: 30,
        5000: 20,
        2000: 30,
        1000: 50,
      },
      coins: {
        5000: 10,
        2000: 20,
        1000: 30,
        500: 40,
        200: 50,
      }
    };
    this.registers = [
      { id: 'register1', name: 'Quầy 1', status: 'ready', default: true },
      { id: 'register2', name: 'Quầy 2', status: 'ready', default: false },
    ];
    this.selectedRegister = this.registers[0];
  }

  /**
   * Connect to the cash drawer
   * @returns {Promise} A promise that resolves when connected
   */
  connect() {
    return new Promise((resolve) => {
      console.log(`Connecting to cash drawer: ${this.selectedRegister.name}`);
      
      // Simulate connection delay
      setTimeout(() => {
        this.connected = true;
        console.log(`Cash drawer ${this.selectedRegister.name} connected successfully`);
        resolve(true);
      }, 600);
    });
  }

  /**
   * Disconnect from the cash drawer
   * @returns {Promise} A promise that resolves when disconnected
   */
  disconnect() {
    return new Promise((resolve) => {
      if (!this.connected) {
        resolve(false);
        return;
      }
      
      console.log(`Disconnecting from cash drawer: ${this.selectedRegister.name}`);
      
      // Simulate disconnection delay
      setTimeout(() => {
        this.connected = false;
        console.log(`Cash drawer ${this.selectedRegister.name} disconnected`);
        resolve(true);
      }, 300);
    });
  }

  /**
   * Open the cash drawer
   * @param {string} reason - The reason for opening the drawer
   * @returns {Promise} A promise that resolves when the drawer is open
   */
  open(reason = 'manual') {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Cash drawer not connected'));
        return;
      }
      
      console.log(`Opening cash drawer (${reason})...`);
      
      // Simulate opening delay
      setTimeout(() => {
        this.isOpen = true;
        console.log('Cash drawer opened successfully');
        
        // Auto-close after 30 seconds
        setTimeout(() => {
          if (this.isOpen) {
            this.isOpen = false;
            console.log('Cash drawer closed automatically');
          }
        }, 30000);
        
        resolve({
          success: true,
          register: this.selectedRegister.id,
          timestamp: new Date().toISOString(),
          reason
        });
      }, 800);
    });
  }

  /**
   * Check if the cash drawer is open
   * @returns {boolean} Whether the drawer is open
   */
  isDrawerOpen() {
    return this.isOpen;
  }

  /**
   * Set the cash count
   * @param {object} count - The cash count object
   * @returns {object} The updated cash count
   */
  setCashCount(count) {
    this.cashCount = { ...this.cashCount, ...count };
    return this.cashCount;
  }

  /**
   * Get the current cash count
   * @returns {object} The cash count
   */
  getCashCount() {
    return this.cashCount;
  }

  /**
   * Calculate the total amount in the drawer
   * @returns {number} The total amount
   */
  getTotalAmount() {
    let total = 0;
    
    // Calculate bills total
    Object.entries(this.cashCount.bills).forEach(([denomination, count]) => {
      total += parseInt(denomination) * count;
    });
    
    // Calculate coins total
    Object.entries(this.cashCount.coins).forEach(([denomination, count]) => {
      total += parseInt(denomination) * count;
    });
    
    return total;
  }
}

// Export a singleton instance
const cashDrawer = new CashDrawer();
export default cashDrawer; 