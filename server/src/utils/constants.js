// ════════════════════════════════════════════════════════════════
// Application Constants
// ════════════════════════════════════════════════════════════════

export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  
  // Authentication
  PASSWORD_MIN_LENGTH: 8,
  JWT_EXPIRY_MINUTES: 15,
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW_MINUTES: 15,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  
  // Product
  MAX_PRODUCT_NAME_LENGTH: 200,
  MAX_PRODUCT_DESCRIPTION_LENGTH: 5000,
  MAX_SEARCH_QUERY_LENGTH: 100,
  MIN_STOCK: 0,
  MAX_QUANTITY_PER_ORDER: 100,
  
  // Order
  TAX_RATE: 0.09, // 9%
  EXPRESS_SHIPPING_COST: 15,
  STANDARD_SHIPPING_COST: 0,
  
  // Payment Methods
  PAYMENT_METHODS: ['credit_card', 'apple_pay', 'cod', 'bank_transfer'],
  
  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPING: 'shipping',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  
  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },
  
  // Banner Types
  BANNER_TYPES: ['main', 'secondary', 'promo', 'featured'],
  
  // Validation Regex
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_VN: /^(\+84|0)[0-9]{9}$/,
    HEX_COLOR: /^#[0-9a-fA-F]{6}$/,
    OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  },
  
  // Response Messages
  MESSAGES: {
    SUCCESS: 'Thành công',
    ERROR: 'Có lỗi xảy ra',
    UNAUTHORIZED: 'Không có quyền truy cập',
    NOT_FOUND: 'Không tìm thấy',
    INVALID_INPUT: 'Dữ liệu không hợp lệ',
  },
};

export default CONSTANTS;
