// frontend/src/services/hardware/barcodeService.js
import { message } from "antd";

/**
 * Service for managing barcode scanning functionality
 */
class BarcodeService {
  constructor() {
    this.isInitialized = false;
    this.onScanCallbacks = [];
    this.scannerType = null;
    this.currentDevice = null;
  }

  /**
   * Initialize the barcode scanner
   */
  async initialize() {
    try {
      // In production, this would connect to actual hardware
      console.log("Barcode scanner initialized");
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize barcode scanner:", error);
      return false;
    }
  }

  /**
   * Register a callback function to be called when a barcode is scanned
   *
   * @param {Function} callback - Function to call with the scanned barcode
   * @returns {Function} - Function to unregister the callback
   */
  onScan(callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    this.onScanCallbacks.push(callback);

    // Return a function to unregister the callback
    return () => {
      this.onScanCallbacks = this.onScanCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Simulate a barcode scan (for testing)
   *
   * @param {string} barcode - The barcode to simulate
   */
  simulateScan(barcode) {
    if (!this.isInitialized) {
      message.error("Barcode scanner not initialized");
      return;
    }

    this.onScanCallbacks.forEach((callback) => {
      callback(barcode);
    });
  }

  /**
   * Check if the device supports barcode scanning
   */
  checkSupport() {
    return {
      supported: true,
      message: "Barcode scanning is supported",
    };
  }

  /**
   * Stop and clean up barcode scanner resources
   */
  cleanup() {
    this.isInitialized = false;
    this.onScanCallbacks = [];
    console.log("Barcode scanner resources cleaned up");
  }
}

export default new BarcodeService();
