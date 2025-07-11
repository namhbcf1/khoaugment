/**
 * Mobile Optimization Utilities
 * Touch gestures, responsive design, and mobile-specific features
 * Trường Phát Computer Hòa Bình
 */

/**
 * Touch gesture handler for mobile interactions
 */
export class TouchGestureHandler {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      swipeThreshold: 50,
      tapTimeout: 300,
      doubleTapTimeout: 300,
      longPressTimeout: 500,
      ...options
    };
    
    this.startX = 0;
    this.startY = 0;
    this.startTime = 0;
    this.lastTap = 0;
    this.longPressTimer = null;
    
    this.bindEvents();
  }

  bindEvents() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
    
    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      this.triggerEvent('longpress', { x: this.startX, y: this.startY });
    }, this.options.longPressTimeout);
    
    this.triggerEvent('touchstart', { x: this.startX, y: this.startY });
  }

  handleTouchMove(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
    
    this.triggerEvent('touchmove', { 
      x: touch.clientX, 
      y: touch.clientY, 
      deltaX, 
      deltaY 
    });
  }

  handleTouchEnd(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = Date.now() - this.startTime;
    
    // Check for swipe
    if (Math.abs(deltaX) > this.options.swipeThreshold || Math.abs(deltaY) > this.options.swipeThreshold) {
      const direction = this.getSwipeDirection(deltaX, deltaY);
      this.triggerEvent('swipe', { direction, deltaX, deltaY, duration });
      return;
    }
    
    // Check for tap
    if (duration < this.options.tapTimeout) {
      const now = Date.now();
      const timeSinceLastTap = now - this.lastTap;
      
      if (timeSinceLastTap < this.options.doubleTapTimeout) {
        this.triggerEvent('doubletap', { x: endX, y: endY });
      } else {
        this.triggerEvent('tap', { x: endX, y: endY });
      }
      
      this.lastTap = now;
    }
    
    this.triggerEvent('touchend', { x: endX, y: endY, duration });
  }

  handleTouchCancel(e) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    
    this.triggerEvent('touchcancel');
  }

  getSwipeDirection(deltaX, deltaY) {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  triggerEvent(type, data = {}) {
    const event = new CustomEvent(type, { detail: data });
    this.element.dispatchEvent(event);
  }

  destroy() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.element.removeEventListener('touchcancel', this.handleTouchCancel);
  }
}

/**
 * Mobile device detection and capabilities
 */
export class MobileDetector {
  static isMobile() {
    return (typeof navigator !== 'undefined' && navigator.userAgent) ?
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false;
  }

  static isTablet() {
    return (typeof navigator !== 'undefined' && navigator.userAgent) ?
      /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent) : false;
  }

  static isIOS() {
    return (typeof navigator !== 'undefined' && navigator.userAgent) ?
      /iPad|iPhone|iPod/.test(navigator.userAgent) : false;
  }

  static isAndroid() {
    return (typeof navigator !== 'undefined' && navigator.userAgent) ?
      /Android/.test(navigator.userAgent) : false;
  }

  static hasTouch() {
    return ('ontouchstart' in window) ||
           (typeof navigator !== 'undefined' && navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  }

  static getScreenSize() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight
    };
  }

  static getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  static getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
  }

  static isLandscape() {
    return window.innerWidth > window.innerHeight;
  }

  static isPortrait() {
    return window.innerHeight > window.innerWidth;
  }

  static supportsVibration() {
    return 'vibrate' in navigator;
  }

  static vibrate(pattern = 200) {
    if (this.supportsVibration()) {
      navigator.vibrate(pattern);
    }
  }
}

/**
 * Mobile-specific UI optimizations
 */
export class MobileUIOptimizer {
  static optimizeForTouch() {
    // Add touch-friendly styles
    const style = document.createElement('style');
    style.textContent = `
      /* Touch-friendly button sizes */
      .btn, button {
        min-height: 44px;
        min-width: 44px;
        padding: 12px 16px;
      }
      
      /* Prevent text selection on touch */
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Touch feedback */
      .touch-feedback {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        transition: background-color 0.1s ease;
      }
      
      .touch-feedback:active {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      /* Prevent zoom on input focus */
      input, select, textarea {
        font-size: 16px;
      }
      
      /* Smooth scrolling */
      * {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Hide scrollbars on mobile */
      @media (max-width: 768px) {
        ::-webkit-scrollbar {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  static preventZoom() {
    // Prevent pinch zoom
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  }

  static addPullToRefresh(callback) {
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (pulling) {
        currentY = e.touches[0].clientY;
        const pullDistance = currentY - startY;
        
        if (pullDistance > 100) {
          // Show pull to refresh indicator
          document.body.style.transform = `translateY(${Math.min(pullDistance - 100, 50)}px)`;
        }
      }
    });
    
    document.addEventListener('touchend', () => {
      if (pulling) {
        const pullDistance = currentY - startY;
        
        if (pullDistance > 100) {
          callback();
        }
        
        document.body.style.transform = '';
        pulling = false;
      }
    });
  }

  static addSwipeNavigation(onSwipeLeft, onSwipeRight) {
    const gestureHandler = new TouchGestureHandler(document.body);
    
    document.body.addEventListener('swipe', (e) => {
      const { direction } = e.detail;
      
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    });
    
    return gestureHandler;
  }
}

/**
 * Mobile performance optimizations
 */
export class MobilePerformanceOptimizer {
  static enableHardwareAcceleration() {
    const style = document.createElement('style');
    style.textContent = `
      .hardware-accelerated {
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        will-change: transform;
      }
      
      .smooth-animation {
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);
  }

  static optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" for better performance
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Optimize for high DPI displays
      if (MobileDetector.getDevicePixelRatio() > 1) {
        const src = img.src;
        if (src && !src.includes('@2x')) {
          const highDpiSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '@2x.$1');
          img.srcset = `${src} 1x, ${highDpiSrc} 2x`;
        }
      }
    });
  }

  static debounceScrollEvents() {
    let scrollTimeout;
    let isScrolling = false;
    
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
      if (type === 'scroll') {
        const debouncedListener = function(e) {
          if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(() => {
              listener(e);
              isScrolling = false;
            });
          }
        };
        
        return originalAddEventListener.call(this, type, debouncedListener, options);
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  static optimizeAnimations() {
    // Reduce animations on low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                          navigator.deviceMemory <= 2;
    
    if (isLowEndDevice) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

/**
 * Mobile-specific utilities
 */
export class MobileUtils {
  static showInstallPrompt() {
    if ('serviceWorker' in navigator) {
      let deferredPrompt;
      
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button
        const installButton = document.createElement('button');
        installButton.textContent = 'Cài đặt ứng dụng';
        installButton.className = 'install-prompt-button';
        installButton.onclick = async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            installButton.remove();
          }
        };
        
        document.body.appendChild(installButton);
      });
    }
  }

  static enableFullscreen() {
    const elem = document.documentElement;
    
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  static exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  static lockOrientation(orientation = 'portrait') {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock(orientation);
    }
  }

  static unlockOrientation() {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  }

  static addToHomeScreen() {
    // This is handled by the beforeinstallprompt event
    // But we can show instructions for manual installation
    const instructions = {
      ios: 'Nhấn nút Share và chọn "Add to Home Screen"',
      android: 'Nhấn menu và chọn "Add to Home Screen"',
      other: 'Sử dụng menu trình duyệt để thêm vào màn hình chính'
    };
    
    let instruction = instructions.other;
    if (MobileDetector.isIOS()) {
      instruction = instructions.ios;
    } else if (MobileDetector.isAndroid()) {
      instruction = instructions.android;
    }
    
    alert(instruction);
  }
}

// Auto-initialize mobile optimizations
if (MobileDetector.isMobile()) {
  document.addEventListener('DOMContentLoaded', () => {
    MobileUIOptimizer.optimizeForTouch();
    MobilePerformanceOptimizer.enableHardwareAcceleration();
    MobilePerformanceOptimizer.optimizeImages();
    MobilePerformanceOptimizer.debounceScrollEvents();
    MobilePerformanceOptimizer.optimizeAnimations();
    MobileUtils.showInstallPrompt();
  });
}
