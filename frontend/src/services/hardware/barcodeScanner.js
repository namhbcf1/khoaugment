/**
 * Barcode Scanner Service - Real implementation for POS barcode scanning
 * Uses QuaggaJS for camera-based scanning and supports USB barcode scanners
 */

import Quagga from 'quagga';

class BarcodeScanner {
  constructor() {
    this.connected = false;
    this.callbacks = [];
    this.scannerType = null;
    this.videoElement = null;
    this.quaggaInitialized = false;
    this.lastScannedCode = null;
    this.lastScannedTime = null;
    this.scannerConfig = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: null, // Will be set when initialized
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 }
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_93_reader",
          "upc_reader",
          "upc_e_reader",
          "codabar_reader",
          "i2of5_reader"
        ],
        debug: {
          showCanvas: false,
          showPatches: false,
          showFoundPatches: false,
          showSkeleton: false,
          showLabels: false,
          showPatchLabels: false,
          showRemainingPatchLabels: false,
          boxFromPatches: {
            showTransformed: false,
            showTransformedBox: false,
            showBB: false
          }
        }
      },
      locate: true
    };
    
    // Bind keyboard event for USB scanners
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.keyBuffer = '';
    this.keyBufferTimeout = null;
  }

  /**
   * Connect to the barcode scanner
   * @param {Object} options - Connection options
   * @param {HTMLElement} options.videoElement - Video element for camera scanning
   * @param {string} options.scannerType - Scanner type ('camera', 'usb', 'both')
   * @returns {Promise<boolean>} Connection status
   */
  async connect(options = {}) {
    const { videoElement, scannerType = 'both' } = options;
    
    this.scannerType = scannerType;
    
    try {
      // Initialize USB scanner (keyboard wedge)
      if (scannerType === 'usb' || scannerType === 'both') {
        this.initKeyboardListener();
      }
      
      // Initialize camera scanner
      if ((scannerType === 'camera' || scannerType === 'both') && videoElement) {
        this.videoElement = videoElement;
        await this.initCameraScanner(videoElement);
      }
      
      this.connected = true;
      console.log(`Barcode scanner connected (${scannerType})`);
      return true;
    } catch (error) {
      console.error('Failed to connect barcode scanner:', error);
      return false;
    }
  }

  /**
   * Initialize camera-based scanner using QuaggaJS
   * @param {HTMLElement} videoElement - Video element for camera feed
   * @returns {Promise<boolean>} Initialization status
   */
  async initCameraScanner(videoElement) {
    if (!videoElement) {
      throw new Error('Video element is required for camera scanning');
    }
    
    return new Promise((resolve, reject) => {
      // Update config with target element
      this.scannerConfig.inputStream.target = videoElement;
      
      Quagga.init(this.scannerConfig, (err) => {
        if (err) {
          console.error('Quagga initialization error:', err);
          reject(err);
          return;
        }
        
        this.quaggaInitialized = true;
        
        // Start scanning
        Quagga.start();
        
        // Set up detection handler
        Quagga.onDetected(this.handleCameraScan.bind(this));
        
        // Set up processing handler for visual feedback
        Quagga.onProcessed(this.handleProcessed.bind(this));
        
        resolve(true);
      });
    });
  }

  /**
   * Initialize keyboard event listener for USB scanners
   */
  initKeyboardListener() {
    // Remove existing listener if any
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // Add listener for keyboard events
    document.addEventListener('keydown', this.handleKeyDown);
    
    console.log('USB barcode scanner listener initialized');
  }

  /**
   * Handle keyboard events for USB scanner
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    // Clear timeout and restart
    if (this.keyBufferTimeout) {
      clearTimeout(this.keyBufferTimeout);
    }
    
    // Detect Enter key as the end of barcode
    if (event.key === 'Enter') {
      // Process the complete barcode
      if (this.keyBuffer.length > 3) {
        this.handleScan(this.keyBuffer);
      }
      
      // Reset buffer
      this.keyBuffer = '';
      return;
    }
    
    // Add character to buffer
    if (event.key.length === 1) {
      this.keyBuffer += event.key;
      
      // Set timeout to clear buffer after 100ms of inactivity
      this.keyBufferTimeout = setTimeout(() => {
        this.keyBuffer = '';
      }, 100);
    }
  }

  /**
   * Handle camera scan result
   * @param {Object} result - Scan result from Quagga
   */
  handleCameraScan(result) {
    const code = result.codeResult.code;
    
    // Debounce scans (prevent multiple scans of same barcode)
    const now = Date.now();
    if (this.lastScannedCode === code && (now - this.lastScannedTime) < 2000) {
      return;
    }
    
    this.lastScannedCode = code;
    this.lastScannedTime = now;
    
    // Process the barcode
    this.handleScan(code);
  }

  /**
   * Handle processed frame for visual feedback
   * @param {Object} result - Processing result
   */
  handleProcessed(result) {
    const drawingCtx = Quagga.canvas.ctx.overlay;
    const drawingCanvas = Quagga.canvas.dom.overlay;
    
    if (result) {
      if (result.boxes) {
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
        result.boxes.filter(function (box) {
          return box !== result.box;
        }).forEach(function (box) {
          Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
        });
      }
      
      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
      }
      
      if (result.codeResult && result.codeResult.code) {
        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
      }
    }
  }

  /**
   * Process scanned barcode
   * @param {string} code - Scanned barcode
   */
  handleScan(code) {
    if (!code || code.length < 4) return;
    
    console.log(`Barcode scanned: ${code}`);
    
    // Notify all registered callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(code);
      } catch (error) {
        console.error('Error in barcode callback:', error);
      }
    });
  }

  /**
   * Disconnect from the barcode scanner
   * @returns {boolean} Disconnection status
   */
  disconnect() {
    try {
      // Stop camera scanning
      if (this.quaggaInitialized) {
        Quagga.stop();
        this.quaggaInitialized = false;
      }
      
      // Remove keyboard listener
      document.removeEventListener('keydown', this.handleKeyDown);
      
      this.connected = false;
      this.scannerType = null;
      this.videoElement = null;
      this.keyBuffer = '';
      
      if (this.keyBufferTimeout) {
        clearTimeout(this.keyBufferTimeout);
        this.keyBufferTimeout = null;
      }
      
      console.log('Barcode scanner disconnected');
      return true;
    } catch (error) {
      console.error('Error disconnecting barcode scanner:', error);
      return false;
    }
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
   * Check if camera is available for scanning
   * @returns {Promise<boolean>} Camera availability
   */
  async isCameraAvailable() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error checking camera availability:', error);
      return false;
    }
  }

  /**
   * Get available cameras
   * @returns {Promise<MediaDeviceInfo[]>} List of camera devices
   */
  async getAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting available cameras:', error);
      return [];
    }
  }

  /**
   * Switch camera
   * @param {string} deviceId - Camera device ID
   * @returns {Promise<boolean>} Success
   */
  async switchCamera(deviceId) {
    if (!this.quaggaInitialized) {
      throw new Error('Scanner not initialized');
    }
    
    try {
      // Stop current scanner
      Quagga.stop();
      
      // Update constraints
      this.scannerConfig.inputStream.constraints.deviceId = deviceId;
      
      // Reinitialize
      await this.initCameraScanner(this.videoElement);
      
      return true;
    } catch (error) {
      console.error('Error switching camera:', error);
      return false;
    }
  }

  /**
   * Set scanner configuration
   * @param {Object} config - Scanner configuration
   */
  setConfig(config) {
    this.scannerConfig = { ...this.scannerConfig, ...config };
    
    // If already initialized, reinitialize with new config
    if (this.quaggaInitialized && this.videoElement) {
      Quagga.stop();
      this.initCameraScanner(this.videoElement).catch(error => {
        console.error('Error reinitializing scanner:', error);
      });
    }
  }

  /**
   * Get current status
   * @returns {Object} Scanner status
   */
  getStatus() {
    return {
      connected: this.connected,
      scannerType: this.scannerType,
      cameraInitialized: this.quaggaInitialized,
      lastScannedCode: this.lastScannedCode,
      lastScannedTime: this.lastScannedTime
    };
  }

  /**
   * Manually trigger scan from image
   * @param {string|HTMLImageElement} image - Image source or element
   * @returns {Promise<string|null>} Scanned barcode or null
   */
  async scanFromImage(image) {
    return new Promise((resolve, reject) => {
      Quagga.decodeSingle({
        decoder: this.scannerConfig.decoder,
        locate: true,
        src: image instanceof HTMLImageElement ? image.src : image
      }, (result) => {
        if (result && result.codeResult) {
          this.handleScan(result.codeResult.code);
          resolve(result.codeResult.code);
        } else {
          resolve(null);
        }
      });
    });
  }
}

// Export a singleton instance
const barcodeScanner = new BarcodeScanner();
export default barcodeScanner; 