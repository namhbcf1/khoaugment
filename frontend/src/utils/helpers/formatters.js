/**
 * Formatters - Utility functions for formatting data
 */

/**
 * Format a number as Vietnamese currency (VND)
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const { 
    currency = 'VND', 
    locale = 'vi-VN', 
    maximumFractionDigits = 0,
    minimumFractionDigits = 0
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits,
    minimumFractionDigits
  }).format(amount || 0);
};

/**
 * Format a date string
 * @param {Date|string} date - The date to format
 * @param {string} format - The format string (default: DD/MM/YYYY)
 * @returns {string} The formatted date string
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  // Simple formatter (can be replaced with dayjs if needed)
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return format
    .replace('DD', day)
    .replace('MM', month)
    .replace('YYYY', year);
};

/**
 * Format a number with thousands separators
 * @param {number} value - The number to format
 * @param {Object} options - Formatting options
 * @returns {string} The formatted number
 */
export const formatNumber = (value, options = {}) => {
  const {
    locale = 'vi-VN',
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options;
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value || 0);
}; 