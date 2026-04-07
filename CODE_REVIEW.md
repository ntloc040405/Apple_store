# Apple Store Clone - Comprehensive Code Review

**Date:** April 7, 2026  
**Project:** Full-stack Apple Store Clone (Client, Admin, Server)  
**Reviewed Components:** 3 applications (Client React, Admin React, Node.js/Express API)

---

## Executive Summary

The Apple Store Clone is a well-structured e-commerce platform with good architectural patterns. However, there are **several critical security vulnerabilities**, **important functional issues**, and **code quality concerns** that need immediate attention before production deployment.

**Priority Issues Count:**
- 🔴 **CRITICAL:** 11 issues
- 🟠 **IMPORTANT:** 15 issues  
- 🟡 **MINOR:** 12 issues

---

# 🔴 CRITICAL ISSUES

## 1. **Hardcoded Admin Credentials in Admin Login**
**Location:** [admin/src/pages/Login.jsx](admin/src/pages/Login.jsx#L1-L20)  
**Severity:** CRITICAL  
**Issue:**
```javascript
const [email, setEmail] = useState('admin@apple.com');
const [password, setPassword] = useState('admin123');
```
Default credentials are exposed in the code and visible in browser DevTools.

**Impact:** Anyone can guess admin credentials or find them through code inspection.

**Fix:**
- Remove default values (leave state empty)
- Never include credentials in frontend code
- Use secure password during setup

---

## 2. **Unrestricted CORS Configuration**
**Location:** [server/src/index.js](server/src/index.js#L21)  
**Severity:** CRITICAL  
**Issue:**
```javascript
app.use(cors());  // No origin restrictions
```

**Impact:** Any domain can make requests to your API, enabling CSRF attacks, unauthorized data access.

**Fix:**
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 3. **Weak JWT Secret Configuration**
**Location:** [server/src/config/index.js](server/src/config/index.js#L6)  
**Severity:** CRITICAL  
**Issue:**
```javascript
jwtSecret: process.env.JWT_SECRET || 'fallback_secret'
```

Using a fallback secret allows attackers to forge tokens if JWT_SECRET is not set.

**Fix:**
```javascript
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}
export default { jwtSecret, /* ... */ };
```

---

## 4. **No Authentication Rate Limiting**
**Location:** [server/src/routes/auth.js](server/src/routes/auth.js)  
**Severity:** CRITICAL  
**Issue:** No rate limiting on `/auth/login` and `/auth/register` endpoints.

**Impact:** Brute force attacks can easily guess user passwords.

**Fix:** Add `express-rate-limit`:
```javascript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, try again later'
});

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
```

---

## 5. **Regex Injection Vulnerability in Search**
**Location:** [server/src/controllers/productController.js](server/src/controllers/productController.js#L101-L111)  
**Severity:** CRITICAL  
**Issue:**
```javascript
// User input directly used in $regex
if (search) filter.$text = { $search: search };
// Also in search endpoint:
filter.$or = [
  { name: { $regex: q, $options: 'i' } },
  { tagline: { $regex: q, $options: 'i' } },
  { description: { $regex: q, $options: 'i' } },
];
```

**Impact:** ReDoS (Regular Expression Denial of Service) attacks can crash the server.

**Fix:**
```javascript
// Escape regex special characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

if (search) {
  const escaped = escapeRegex(q.trim()).slice(0, 100); // limit length
  filter.name = { $regex: escaped, $options: 'i' };
}
```

---

## 6. **Sensitive Data Exposed in localStorage**
**Location:** [client/src/context/AuthContext.jsx](client/src/context/AuthContext.jsx#L26-L30)  
**Severity:** CRITICAL  
**Issue:**
```javascript
localStorage.setItem('apple_token', token);
localStorage.setItem('apple_user', JSON.stringify(u));
```

JWT tokens and user data stored in localStorage are vulnerable to XSS attacks.

**Impact:** If XSS is found, attackers can steal authentication tokens.

**Fix:**
- Use httpOnly cookies for tokens (requires backend support)
- Store only non-sensitive data in localStorage
- Implement Content Security Policy (CSP) headers
- Sanitize all user inputs to prevent XSS

```javascript
// Should be httpOnly cookie instead (backend sets it)
// Frontend only reads it from httpOnly cookie, can't access via JS
```

---

## 7. **No Input Validation in Banner Creation**
**Location:** [server/src/controllers/bannerController.js](server/src/controllers/bannerController.js#L16-L22)  
**Severity:** CRITICAL  
**Issue:**
```javascript
export const create = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);  // No validation!
    res.status(201).json({ success: true, data: banner });
  }
};
```

**Impact:** Malicious data can be stored in database, potential for HTML injection.

**Fix:**
```javascript
export const create = async (req, res) => {
  try {
    const { title, subtitle, image, bgColor, type } = req.body;
    
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Title required' });
    }
    
    // Validate color format
    if (bgColor && !/^#[0-9a-f]{6}$/i.test(bgColor)) {
      return res.status(400).json({ success: false, message: 'Invalid color' });
    }
    
    const banner = await Banner.create({ title: title.trim(), subtitle, image, bgColor, type });
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

---

## 8. **Inadequate File Upload Validation**
**Location:** [server/src/middleware/upload.js](server/src/middleware/upload.js)  
**Severity:** CRITICAL  
**Issue:**
```javascript
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
};
```

Only checks MIME type, which can be spoofed. No filename sanitization.

**Impact:** Attackers can upload malicious files or execute them.

**Fix:**
```javascript
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Use random filename, preserve extension
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `${uuidv4()}${ext}`;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check both MIME type and extension
    if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
};
```

---

## 9. **No Token Refresh or Expiration Handling**
**Location:** [client/src/api/client.js](client/src/api/client.js#L11-L21)  
**Severity:** CRITICAL  
**Issue:**
```javascript
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('apple_token');  // Only removes on 401
      localStorage.removeItem('apple_user');
    }
    return Promise.reject(err);
  }
);
```

No refresh token mechanism. Old tokens valid indefinitely if not expired on backend.

**Impact:** Leaked tokens can be used forever.

**Fix:**
1. Implement short-lived access tokens (15-30 minutes)
2. Add refresh tokens (7 days, httpOnly cookie)
3. Implement token refresh endpoint
4. Auto-refresh access token before expiry

```javascript
let tokenRefreshPromise = null;

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      if (!tokenRefreshPromise) {
        tokenRefreshPromise = API.post('/auth/refresh').then(res => {
          localStorage.setItem('apple_token', res.data.token);
          tokenRefreshPromise = null;
          return res.data.token;
        }).catch(() => {
          localStorage.removeItem('apple_token');
          window.location.href = '/login';
        });
      }
      
      const token = await tokenRefreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return API(original);
    }
    return Promise.reject(err);
  }
);
```

---

## 10. **Unsafe Order Creation with Race Condition**
**Location:** [server/src/controllers/orderController.js](server/src/controllers/orderController.js#L40-L70)  
**Severity:** CRITICAL  
**Issue:**
```javascript
// Check stock
if (product.stock < item.quantity) {...}

// Later, update stock with no atomicity guarantee
const result = await Product.findOneAndUpdate(
  { _id: item.product, stock: { $gte: item.quantity } },
  { $inc: { stock: -item.quantity } }
);
```

Between the check and the update, another request could lower stock to below the requirement.

**Impact:** Overselling inventory or duplicate orders with insufficient stock.

**Fix:** Use MongoDB transactions:
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  for (const item of orderItems) {
    const product = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { session, new: true }
    );
    
    if (!product) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false, 
        message: `"${item.name}" is out of stock` 
      });
    }
  }
  
  const order = await Order.create([{ user: req.user._id, items: orderItems, ... }], { session });
  await session.commitTransaction();
  res.json({ success: true, data: order[0] });
} catch (err) {
  await session.abortTransaction();
  res.status(500).json({ success: false, message: err.message });
} finally {
  await session.endSession();
}
```

---

## 11. **Hardcoded MongoDB Credentials in Docker Compose**
**Location:** [docker-compose.yml](docker-compose.yml#L23-L25)  
**Severity:** CRITICAL  
**Issue:**
```yaml
environment:
  ME_CONFIG_BASICAUTH_USERNAME: admin
  ME_CONFIG_BASICAUTH_PASSWORD: password  # Hardcoded!
```

**Impact:** Anyone with docker-compose.yml can access MongoDB admin panel.

**Fix:**
```yaml
environment:
  ME_CONFIG_BASICAUTH_USERNAME: ${MONGO_EXPRESS_USER:-admin}
  ME_CONFIG_BASICAUTH_PASSWORD: ${MONGO_EXPRESS_PASSWORD}  # Required env var
```

Create `.env.example` and require setup.

---

# 🟠 IMPORTANT ISSUES

## 12. **Missing Error Boundaries in React**
**Location:** [client/src/App.jsx](client/src/App.jsx#L1-L50)  
**Severity:** IMPORTANT  
**Issue:** No Error Boundary component to catch React errors.

**Impact:** A single component error crashes entire app.

**Fix:**
```javascript
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap in AppLayout or routes
<ErrorBoundary>
  <AppLayout />
</ErrorBoundary>
```

---

## 13. **useEffect Missing Dependencies in ProductDetail**
**Location:** [client/src/pages/ProductDetail.jsx](client/src/pages/ProductDetail.jsx#L53-L80)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
useEffect(() => {
  // ... code that uses checkEligibility, fetchReviews
  if (user) checkEligibility(p._id);
  fetchReviews(p._id);
  // ... 
}, [slug, user, checkEligibility, fetchReviews]); // ✓ Correct
```

Actually this one is correct! But check for similar issues elsewhere.

---

## 14. **Potential Memory Leak in Home Component**
**Location:** [client/src/pages/Home.jsx](client/src/pages/Home.jsx#L29-L45)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
useEffect(() => {
  if (!loading && banners.filter(b => b.type === 'main').length > 1) {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % banners.filter(b => b.type === 'main').length);
    }, 6000);
    return () => clearInterval(timer);  // ✓ Good
  }
}, [loading, banners]);
```

This one is correct too, but missing `banners` in dependency could cause stale closure.

---

## 15. **Cart Out of Sync with Server**
**Location:** [client/src/context/CartContext.jsx](client/src/context/CartContext.jsx#L1-L50)  
**Severity:** IMPORTANT  
**Issue:** Client maintains local cart in localStorage while server has separate Cart collection. They can get out of sync.

**Impact:** 
- User modifies cart offline, server cart shows different items
- Checkout uses localStorage, which may not match server state

**Fix:** Sync with server on app load and periodically:
```javascript
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  
  // Load cart from server when user logs in
  useEffect(() => {
    if (user) {
      API.get('/cart')
        .then(res => {
          dispatch({ 
            type: 'LOAD_FROM_SERVER', 
            payload: res.data.data.items 
          });
        })
        .catch(console.error);
    }
  }, [user]);

  // Sync to server after any change
  useEffect(() => {
    if (user) {
      // Debounce and sync
      const timeout = setTimeout(() => {
        syncToServer(state.items);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [state, user]);
  
  // ... rest of provider
}
```

---

## 16. **Admin Auth Check Not Enforced on All Routes**
**Location:** [admin/src/context/AuthContext.jsx](admin/src/context/AuthContext.jsx#L15)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
const login = async (email, password) => {
  const res = await API.post('/auth/login', { email, password });
  const { user: u, token } = res.data.data;
  if (u.role !== 'admin') throw new Error('...'); // ✓ Good
  // ...
};
```

Good on login, but backend should also verify admin on protected routes. Check [server/src/routes/admin.js](server/src/routes/admin.js#L1-L15):

```javascript
const router = Router();
router.use(auth, admin);  // ✓ Good middleware chain
```

Actually this is correct! But verify all admin endpoints have this protection.

---

## 17. **No Pagination Validation**
**Location:** [server/src/controllers/adminController.js](server/src/controllers/adminController.js#L1-L20)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
const { page = 1, limit = 20, search, role } = req.query;
// No validation on page/limit values
const skip = (page - 1) * limit;
const users = await User.find(filter)
  .skip(skip)
  .limit(Number(limit)); // Could be very large
```

**Impact:** Attacker could request limit=1000000 to DoS the database.

**Fix:**
```javascript
const page = Math.max(1, parseInt(req.query.page || 1, 10));
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || 20, 10)));

const skip = (page - 1) * limit;
```

Same issue in [productController.js](server/src/controllers/productController.js#L54-L60), [reviewController.js](server/src/controllers/reviewController.js), etc.

---

## 18. **Inconsistent Input Validation**
**Location:** Multiple controllers  
**Severity:** IMPORTANT  
**Issues:**
- [authController.js](server/src/controllers/authController.js#L5) - No email format validation
- [authController.js](server/src/controllers/authController.js#L8) - Takes phone but no validation
- [updateProfile](server/src/controllers/authController.js#L47) - No validation on name length

**Fix:** Add input validation middleware:
```javascript
import { body, validationResult } from 'express-validator';

router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Min 8 chars'),
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('phone').optional().isMobilePhone()
], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}, register);
```

---

## 19. **No Request Timeout Configuration**
**Location:** [client/src/api/client.js](client/src/api/client.js#L1-L5)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
const API = axios.create({ baseURL: 'http://localhost:5001/api' });
// No timeout set
```

**Impact:** Requests hang indefinitely if server is down.

**Fix:**
```javascript
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000  // 10 seconds
});
```

---

## 20. **XSS Vulnerability in React Rendering**
**Location:** [admin/src/pages/Dashboard.jsx](admin/src/pages/Dashboard.jsx#L1-L100)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
<P style={{ margin: '0 auto 60px' }}>{mainBanners[heroIndex].subtitle}</P>
```

User-controlled content from banners rendered without sanitization.

**Impact:** If admin injects HTML, it executes in user's browser (though XSS here, still a risk).

**Fix:**
```javascript
import DOMPurify from 'dompurify';

const sanitized = DOMPurify.sanitize(mainBanners[heroIndex].subtitle, { 
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong'], // Whitelist only safe tags
  ALLOWED_ATTR: [] 
});
```

---

## 21. **No HTTPS Enforcement**
**Location:** [server/src/index.js](server/src/index.js)  
**Severity:** IMPORTANT  
**Issue:** No HSTS headers or HTTPS redirect.

**Fix:**
```javascript
import helmet from 'helmet';

app.use(helmet());  // Sets security headers including HSTS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.get('host')}${req.url}`);
  }
  next();
});
```

---

## 22. **API Base URL Hardcoded**
**Location:** [client/src/api/client.js](client/src/api/client.js#L3), [admin/src/api/client.js](admin/src/api/client.js#L3)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
const API = axios.create({ baseURL: 'http://localhost:5001/api' });
```

Hardcoded for development, breaks in production.

**Fix:**
```javascript
const API = axios.create({ 
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api'
});
```

Add to `.env.production`:
```
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## 23. **Admin Credentials Visible in Default Login**
**Location:** [admin/src/pages/Login.jsx](admin/src/pages/Login.jsx#L10-L11)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
const [email, setEmail] = useState('admin@apple.com');
const [password, setPassword] = useState('admin123');
```

**Fix:** Already covered in CRITICAL #1 - remove these defaults.

---

## 24. **No CSRF Protection**
**Location:** [server/src/index.js](server/src/index.js)  
**Severity:** IMPORTANT  
**Issue:** No CSRF tokens generated or validated.

**Fix:**
```javascript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());
const csrfProtection = csrf({ cookie: false }); // Use sessions instead

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ token: req.csrfToken() });
});

app.post('/api/*', csrfProtection, ...);
```

---

## 25. **Race Condition in Review Eligibility Check**
**Location:** [server/src/controllers/reviewController.js](server/src/controllers/reviewController.js#L55-L75)  
**Severity:** IMPORTANT  
**Issue:**
```javascript
// Check if already reviewed (from unique index)
const hasPurchased = await Order.findOne({ user: userId, status: 'delivered', 'items.product': productId });
// ...
const review = await Review.create({ 
  product: productId, user: userId, parentId: parentId || null, ...
});
```

If same user submits 2 reviews simultaneously, both could pass the check due to race condition.

**Database:** Actually has unique index but needs verification.

---

## 26. **No Logging/Monitoring**
**Location:** [server/src/index.js](server/src/index.js)  
**Severity:** IMPORTANT  
**Issue:** Only console.log/error used, no structured logging.

**Fix:**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console());
}
```

---

# 🟡 MINOR ISSUES

## 27. **Inconsistent Error Messages**
**Files:** Multiple controllers  
**Issue:** Mixed English and Vietnamese error messages make i18n difficult.

**Fix:** Use i18n library:
```javascript
// Create messages.json
{
  "errors": {
    "email_required": "Email is required",
    "invalid_email": "Invalid email format"
  }
}

// In controller
return res.status(400).json({ 
  success: false, 
  message: i18n.t('errors.email_required')
});
```

---

## 28. **Missing TypeScript**
**Severity:** MINOR  
**Issue:** No type safety. Easy to pass wrong types.

**Recommendation:** Gradually adopt TypeScript for:
- API client interfaces
- React component props
- Redux/Context types

---

## 29. **Duplicate Validation Logic**
**Issue:** Product validation exists in controller AND schema. Cart validation repeated.

**Fix:** DRY principle - create reusable validators:
```javascript
// validators/productValidator.js
export const validateProduct = (data, isUpdate = false) => { /* ... */ };

// controllers/productController.js
const errors = validateProduct(req.body, false);
if (errors.length) return res.status(400).json({ success: false, message: errors.join(' ') });
```

---

## 30. **No Loading State Management**
**Issue:** Multiple API calls but no global loading state.

**Recommendation:** Consider Redux or Zustand for:
```javascript
- Global API loading state
- Error state
- Request cancellation
- Retry logic
```

---

## 31. **Unused Imports & Code**
**Issue:** Some files have unused imports that should be cleaned up.

---

## 32. **No Environment Configuration Validation**
**Location:** [server/src/config/index.js](server/src/config/index.js)  
**Issue:** Doesn't validate required env vars on startup.

**Fix:**
```javascript
const requiredEnvs = ['JWT_SECRET', 'MONGODB_URI'];
const missing = requiredEnvs.filter(env => !process.env[env]);

if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}
```

---

## 33. **No Request ID Tracking**
**Issue:** Can't trace requests through logs.

**Fix:**
```javascript
import { v4 as uuidv4 } from 'uuid';

app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});
```

---

## 34. **Inconsistent Response Format**
**Issue:** Some endpoints return `data` wrapped, others return direct objects.

**Fix:** Standardize all responses:
```javascript
// Always use this format
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string,
  pagination?: { page, limit, total, totalPages }
}
```

---

## 35. **No Versioning for API**
**Issue:** Difficult to make breaking changes without breaking existing clients.

**Recommendation:** Implement API versioning:
```
/api/v1/products
/api/v2/products (breaking changes)
```

---

## 36. **Magic Numbers Throughout**
**Examples:**
- Stock quantity: `Math.max(1, item.quantity - 1)`
- Price precision: `Math.round(...* 100) / 100`
- Tax rate: `0.09`

**Fix:** Use constants:
```javascript
const CONSTANTS = {
  MAX_ITEMS_PER_PRODUCT: 10,
  TAX_RATE: 0.09,
  SHIPPING_COST_EXPRESS: 15,
  PASSWORD_MIN_LENGTH: 8
};
```

---

## 37. **Incomplete Error Responses**
**Issue:** Some 500 errors just return `err.message` which might expose internal details.

**Fix:**
```javascript
catch (err) {
  if (process.env.NODE_ENV === 'development') {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } else {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
```

---

## 38. **No Input Sanitization on Text Fields**
**Issue:** No `.trim()` on many text inputs.

**Fix:**
```javascript
const name = req.body.name?.trim();
if (!name) return res.status(400).json({ success: false, message: 'Name required' });
```

---

# Summary Table

| Issue | File | Severity | Line | Action |
|-------|------|----------|------|--------|
| Hardcoded Admin Creds | admin/Login.jsx | 🔴 | L10-11 | Remove defaults |
| No CORS Restriction | server/index.js | 🔴 | L21 | Restrict origins |
| Weak JWT Secret | server/config/index.js | 🔴 | L6 | Require env var |
| No Auth Rate Limit | server/auth.js | 🔴 | - | Add express-rate-limit |
| ReDoS in Search | server/productController.js | 🔴 | L101-111 | Escape regex |
| Tokens in localStorage | client/AuthContext.jsx | 🔴 | L26-30 | Use httpOnly cookies |
| No Banner Validation | server/bannerController.js | 🔴 | - | Add validation |
| Weak File Upload | server/upload.js | 🔴 | L20-27 | Better validation |
| No Token Refresh | client/client.js | 🔴 | - | Implement refresh tokens |
| Race Condition Orders | server/orderController.js | 🔴 | L40-70 | Use MongoDB transactions |
| Hardcoded Mongo Creds | docker-compose.yml | 🔴 | L23-25 | Use env vars |
| No Error Boundaries | client/App.jsx | 🟠 | - | Add ErrorBoundary |
| Out of Sync Cart | client/CartContext.jsx | 🟠 | - | Sync with server |
| No Pagination Limit | server/adminController.js | 🟠 | L4 | Validate max limit |
| Missing Email Validation | server/authController.js | 🟠 | L5 | Use express-validator |

---

## Recommended Priority Order

1. **IMMEDIATE (Next 48 hours):**
   - Remove hardcoded credentials ❌
   - Fix CORS configuration ✅
   - Implement auth rate limiting 📊
   - Add input validation 📝
   - Fix ReDoS vulnerability 🔍
   - Use MongoDB transactions for orders 🔄

2. **SHORT TERM (This week):**
   - Implement token refresh ♻️
   - Add file upload security 📁
   - Fix race conditions 🔒
   - Add error boundaries 🛡️
   - Setup HTTPS/HSTS 🔐
   - Add logging 📋

3. **MEDIUM TERM (This month):**
   - Implement CSRF protection 🚫
   - Add API versioning 🔢
   - TypeScript migration 📘
   - Environment validation ✔️
   - Structured logging 📊

---

## Testing Recommendations

```bash
# Security Testing
- Run OWASP ZAP scan
- SQL/NoSQL injection testing
- XSS payload testing
- CSRF token validation

# Performance Testing
- Load testing with k6 or Artillery
- Database query optimization
- API response time monitoring

# Manual Testing
- Test all auth flows
- Test cart sync between client & server
- Test concurrent order placement
- Test file upload validation
```

---

## Deployment Checklist

- [ ] All .env variables set (no defaults for secrets)
- [ ] HTTPS enabled with valid certificate
- [ ] CORS configured for specific domains
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Database backups automated
- [ ] Error monitoring (Sentry/NewRelic)
- [ ] Security headers set
- [ ] Input validation on all endpoints
- [ ] Tests passing (unit, integration, e2e)
- [ ] Load testing passed
- [ ] Security audit completed

---

**Report Generated:** April 7, 2026  
**Estimated Remediation Time:** 2-3 weeks for all critical and important issues
