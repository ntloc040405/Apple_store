// ════════════════════════════════════════════════════════════════
// Input Validation Utilities
// ════════════════════════════════════════════════════════════════

/**
 * Validate and sanitize pagination params
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} {page, limit} - Validated values
 */
export const validatePagination = (page = 1, limit = 20) => {
  const validPage = Math.max(1, parseInt(page || 1, 10));
  const validLimit = Math.min(100, Math.max(1, parseInt(limit || 20, 10)));
  return { page: validPage, limit: validLimit };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email?.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} {isValid, message}
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
  }
  return { isValid: true };
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^(\+84|0)[0-9]{9}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Escape regex special characters to prevent ReDoS
 * @param {string} str - String to escape
 * @returns {string}
 */
export const escapeRegex = (str) => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Trim and validate string length
 * @param {string} str - String to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null}
 */
export const validateString = (str, maxLength = 1000) => {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
};

/**
 * Validate object ID format
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate hex color format
 * @param {string} color - Color to validate
 * @returns {boolean}
 */
export const isValidHexColor = (color) => {
  return /^#[0-9a-fA-F]{6}$/.test(color);
};

/**
 * Sanitize search query
 * @param {string} query - Search query
 * @param {number} maxLength - Max query length
 * @returns {string}
 */
export const sanitizeSearchQuery = (query, maxLength = 100) => {
  return escapeRegex(query?.trim() || '').slice(0, maxLength);
};

export default {
  validatePagination,
  isValidEmail,
  validatePassword,
  isValidPhone,
  escapeRegex,
  validateString,
  isValidObjectId,
  isValidHexColor,
  sanitizeSearchQuery,
};
