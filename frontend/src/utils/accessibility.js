/**
 * Accessibility utilities for KhoAugment POS
 * Provides WCAG 2.1 AA compliance helpers and utilities
 */

// ARIA label generators
export const generateAriaLabel = (type, context = {}) => {
  const labels = {
    button: {
      add: `Thêm ${context.item || 'mục'}`,
      edit: `Chỉnh sửa ${context.item || 'mục'}`,
      delete: `Xóa ${context.item || 'mục'}`,
      save: `Lưu ${context.item || 'thay đổi'}`,
      cancel: 'Hủy bỏ',
      close: 'Đóng',
      menu: 'Mở menu',
      search: 'Tìm kiếm',
      filter: 'Lọc dữ liệu',
      refresh: 'Làm mới dữ liệu',
      export: 'Xuất dữ liệu',
      import: 'Nhập dữ liệu',
      print: 'In báo cáo'
    },
    input: {
      search: 'Nhập từ khóa tìm kiếm',
      email: 'Nhập địa chỉ email',
      password: 'Nhập mật khẩu',
      name: 'Nhập họ tên',
      phone: 'Nhập số điện thoại',
      price: 'Nhập giá tiền',
      quantity: 'Nhập số lượng'
    },
    status: {
      loading: 'Đang tải dữ liệu',
      error: 'Có lỗi xảy ra',
      success: 'Thành công',
      warning: 'Cảnh báo',
      info: 'Thông tin'
    },
    navigation: {
      main: 'Menu chính',
      breadcrumb: 'Đường dẫn trang',
      pagination: 'Phân trang',
      tab: 'Tab điều hướng'
    }
  };

  return labels[type]?.[context.action] || labels[type] || '';
};

// Keyboard navigation helpers
export const handleKeyboardNavigation = (event, options = {}) => {
  const { onEnter, onEscape, onArrowUp, onArrowDown, onTab } = options;

  switch (event.key) {
    case 'Enter':
      if (onEnter) {
        event.preventDefault();
        onEnter(event);
      }
      break;
    case 'Escape':
      if (onEscape) {
        event.preventDefault();
        onEscape(event);
      }
      break;
    case 'ArrowUp':
      if (onArrowUp) {
        event.preventDefault();
        onArrowUp(event);
      }
      break;
    case 'ArrowDown':
      if (onArrowDown) {
        event.preventDefault();
        onArrowDown(event);
      }
      break;
    case 'Tab':
      if (onTab) {
        onTab(event);
      }
      break;
    default:
      break;
  }
};

// Focus management
export const focusManagement = {
  // Trap focus within an element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Set focus to element with fallback
  setFocus: (selector, fallbackSelector = null) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      return true;
    }
    
    if (fallbackSelector) {
      const fallback = document.querySelector(fallbackSelector);
      if (fallback) {
        fallback.focus();
        return true;
      }
    }
    
    return false;
  },

  // Save and restore focus
  saveFocus: () => {
    return document.activeElement;
  },

  restoreFocus: (element) => {
    if (element && element.focus) {
      element.focus();
    }
  }
};

// Screen reader announcements
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Color contrast utilities
export const colorContrast = {
  // Check if color combination meets WCAG AA standards
  meetsWCAG: (foreground, background) => {
    const ratio = colorContrast.getContrastRatio(foreground, background);
    return ratio >= 4.5; // WCAG AA standard
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1, color2) => {
    const l1 = colorContrast.getLuminance(color1);
    const l2 = colorContrast.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Get relative luminance of a color
  getLuminance: (color) => {
    const rgb = colorContrast.hexToRgb(color);
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  // Convert hex color to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
};

// Touch target utilities
export const touchTarget = {
  // Minimum touch target size (44px x 44px for WCAG)
  minSize: 44,

  // Check if element meets minimum touch target size
  meetsMinimumSize: (element) => {
    const rect = element.getBoundingClientRect();
    return rect.width >= touchTarget.minSize && rect.height >= touchTarget.minSize;
  },

  // Add touch target padding if needed
  ensureMinimumSize: (element) => {
    const rect = element.getBoundingClientRect();
    const widthDiff = touchTarget.minSize - rect.width;
    const heightDiff = touchTarget.minSize - rect.height;

    if (widthDiff > 0) {
      element.style.paddingLeft = `${widthDiff / 2}px`;
      element.style.paddingRight = `${widthDiff / 2}px`;
    }

    if (heightDiff > 0) {
      element.style.paddingTop = `${heightDiff / 2}px`;
      element.style.paddingBottom = `${heightDiff / 2}px`;
    }
  }
};

// Form accessibility helpers
export const formAccessibility = {
  // Associate label with input
  associateLabel: (inputId, labelText) => {
    const input = document.getElementById(inputId);
    const label = document.querySelector(`label[for="${inputId}"]`);
    
    if (input && !label) {
      const newLabel = document.createElement('label');
      newLabel.setAttribute('for', inputId);
      newLabel.textContent = labelText;
      input.parentNode.insertBefore(newLabel, input);
    }
  },

  // Add error message with proper ARIA attributes
  addErrorMessage: (inputId, errorMessage) => {
    const input = document.getElementById(inputId);
    const errorId = `${inputId}-error`;
    
    // Remove existing error
    const existingError = document.getElementById(errorId);
    if (existingError) {
      existingError.remove();
    }

    // Add new error
    const errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = errorMessage;

    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');
    input.parentNode.appendChild(errorElement);
  },

  // Clear error message
  clearErrorMessage: (inputId) => {
    const input = document.getElementById(inputId);
    const errorId = `${inputId}-error`;
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.remove();
    }

    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
  }
};

// Reduced motion utilities
export const reducedMotion = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Apply animation only if user doesn't prefer reduced motion
  conditionalAnimation: (element, animation) => {
    if (!reducedMotion.prefersReducedMotion()) {
      element.style.animation = animation;
    }
  }
};

// Export all utilities
export default {
  generateAriaLabel,
  handleKeyboardNavigation,
  focusManagement,
  announceToScreenReader,
  colorContrast,
  touchTarget,
  formAccessibility,
  reducedMotion
};
