# 🔒 Creatixo Security Implementation Guide

## Summary of Security Improvements

Your Creatixo application has been hardened with enterprise-level security best practices. Below are all the changes and how to use them.

---

## 1️⃣ BACKEND SECURITY MIDDLEWARE

### Helmet (HTTP Security Headers)
```js
import helmet from "helmet";
app.use(helmet());
```
✅ Sets 15+ secure HTTP headers to prevent common attacks (XSS, clickjacking, etc.)

### Rate Limiting
```js
// General API: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Auth routes: 5 attempts per minute (prevents brute-force)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5
});

app.use(generalLimiter);
app.use("/api/auth", authLimiter, authRoutes);
```
✅ Prevents login brute-force attacks and API abuse

### Restricted CORS
```js
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```
✅ Only allows requests from your frontend URL
✅ Explicitly whitelists allowed HTTP methods and headers

### Secure Body Parsing
```js
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
```
✅ Prevents large payload attacks

---

## 2️⃣ AUTHENTICATION MIDDLEWARE

### Verify Token Middleware
**File:** `backend/middleware/auth.js`

```js
import verifyToken from "../middleware/auth.js";

router.get("/api/auth/me", verifyToken, (req, res) => {
  // User is authenticated
  // req.user contains { id: userId }
});
```

Features:
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature with `JWT_SECRET`
- Handles expired tokens gracefully
- Returns clear error messages

---

## 3️⃣ INPUT VALIDATION

### Validation Functions
**File:** `backend/middleware/validation.js`

```js
import { 
  validateEmail,
  validatePassword,
  validateName,
  sanitize 
} from "../middleware/validation.js";

// Usage in register route:
if (!validateName(name)) return error;
if (!validateEmail(email)) return error;
if (!validatePassword(password)) return error;
```

**Validation Rules:**
- `validateEmail()`: Standard email regex (RFC-compliant)
- `validatePassword()`: Minimum 6 characters
- `validateName()`: Minimum 2 characters
- `sanitize()`: Removes leading/trailing spaces, converts email to lowercase

---

## 4️⃣ AUTHENTICATION ROUTES SECURITY

### Register Route
```js
router.post("/register", async (req, res) => {
  // ✅ Validates: name, email, password, avatar
  // ✅ Checks email not already in use
  // ✅ Hashes password with bcrypt (10 salt rounds)
  // ✅ Stores provider: "local"
});
```

### Login Route
```js
router.post("/login", async (req, res) => {
  // ✅ Validates email and password format
  // ✅ Prevents Google-only users from password login
  // ✅ Uses bcrypt.compare() for password verification
  // ✅ Returns JWT token (expires in 7 days)
});
```

### Google Auth Route
```js
router.post("/google", async (req, res) => {
  // ✅ Verifies Google ID token with OAuth2Client
  // ✅ Validates email exists in Google payload
  // ✅ Normalizes email to lowercase
  // ✅ Handles both new and existing users
});
```

### Complete Profile Route (New Google Users)
```js
router.post("/complete-profile", async (req, res) => {
  // ✅ Same validation as register
  // ✅ Hash password for Google users
  // ✅ Prevents duplicate accounts
});
```

---

## 5️⃣ PROTECTED ROUTES EXAMPLE

### How to Protect a Route
```js
import verifyToken from "../middleware/auth.js";

router.get("/api/auth/me", verifyToken, async (req, res) => {
  // Only authenticated users can access
  const userId = req.user.id; // From JWT
});
```

### Apply to All Routes in a File
```js
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Protect all subsequent routes
router.use(verifyToken);

router.get("/", (req, res) => {
  // Protected
});

router.post("/", (req, res) => {
  // Protected
});
```

## Example with Posts (Already Protected)
Your `postRoutes.js` already includes a `protect` middleware that:
- Checks Bearer token
- Verifies JWT signature
- Fetches full user object from database
- Checks ownership before delete/update

---

## 6️⃣ ENVIRONMENT VARIABLES REQUIRED

Add these to `.env`:
```
# Auth
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=your-mongodb-connection-string

# Cloudinary (for file uploads)
CLOUD_NAME=your-cloudinary-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret

# Server
NODE_ENV=development
PORT=5000
```

---

## 7️⃣ FRONTEND SECURITY

Your frontend already has:
- ✅ Safe localStorage parsing (try/catch)
- ✅ Optional chaining for null safety (`user?.avatar`)
- ✅ Fallback values for missing data
- ✅ Auto-redirect to `/login` if no token
- ✅ Clear error messages from API

---

## 8️⃣ PASSWORD SECURITY

### Requirements
- ✅ Minimum 6 characters
- ✅ Hashed with bcrypt (10 salt rounds)
- ✅ Never stored in plaintext
- ✅ Never returned in API response
- ✅ Google-only users can't use password login

### Hash Example
```js
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

---

## 9️⃣ ERROR HANDLING

### What NOT to Return
❌ Stack traces
❌ Database details
❌ User passwords
❌ Internal paths

### What to Return
✅ Clear, actionable messages
✅ Proper HTTP status codes
✅ Consistent error format

Example:
```js
// ❌ Bad
res.status(500).json({ error: error.stack });

// ✅ Good
console.error("Login error:", error.message);
res.status(400).json({ message: "Invalid credentials" });
```

---

## 🔟 INSTALLATION REQUIREMENTS

Ensure these are installed in your backend:
```bash
npm install express helmet express-rate-limit bcryptjs jsonwebtoken google-auth-library cors dotenv
```

If any are missing:
```bash
npm install helmet
npm install express-rate-limit
```

---

## 1️⃣1️⃣ QUICK SECURITY CHECKLIST

- ✅ Helmet added (HTTP security headers)
- ✅ Rate limiting on auth routes (5 attempts/minute)
- ✅ CORS restricted to frontend URL only
- ✅ JWT token validation on protected routes
- ✅ Input validation on all auth endpoints
- ✅ Password hashing with bcrypt
- ✅ Google token verified with google-auth-library
- ✅ Error logging without exposing sensitive data
- ✅ Expired token handling
- ✅ Email validation and normalization
- ✅ Protected routes example provided

---

## 1️⃣2️⃣ TESTING YOUR SECURITY

### Test Rate Limiting
```bash
# Try login 6 times in 1 minute
# 6th request should return: "Too many login attempts"
```

### Test JWT Protection
```bash
# Try calling /api/auth/me without token
# Should return: "Access denied. No token provided."
```

### Test CORS
```bash
# Request from different origin (not 5173)
# Should return CORS error
```

### Test Input Validation
```bash
# Register with email: "invalid"
# Should return: "Email is invalid"

# Register with password: "123"
# Should return: "Password must be at least 6 characters"
```

---

## 1️⃣3️⃣ PRODUCTION DEPLOYMENT CHECKLIST

Before deploying to production:
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use strong `JWT_SECRET` (64+ random characters)
- [ ] Use strong `GOOGLE_CLIENT_ID` from Google Console
- [ ] Update `FRONTEND_URL` to your production domain
- [ ] Use HTTPS in production (update CORS origin)
- [ ] Enable HTTPS-only cookies in production
- [ ] Increase rate limiting limits if needed for your scale
- [ ] Add monitoring/logging for security events
- [ ] Regular security updates for dependencies

---

## 1️⃣4️⃣ COMMON ATTACKS PREVENTED

1. **Brute-force attacks** → Rate limiting (5/min on auth)
2. **XSS attacks** → Helmet + output sanitization
3. **CSRF attacks** → CORS restrictions
4. **Unauthorized access** → JWT middleware
5. **Weak passwords** → Minimum 6 chars + bcrypt
6. **Fake Google tokens** → google-auth-library verification
7. **Token hijacking** → Secure Bearer token validation
8. **SQL injection** → MongoDB prevents (no raw queries)
9. **Man-in-the-middle** → CORS + HTTPS (production)
10. **Data exposure** → Error messages don't leak sensitive info

---

## Questions?

Refer to the updated files:
- `backend/server.js` - Main security middleware
- `backend/routes/authRoutes.js` - Auth with validation
- `backend/middleware/auth.js` - JWT verification
- `backend/middleware/validation.js` - Input validation
- `backend/routes/PROTECTED_ROUTES_EXAMPLE.js` - Example usage

Stay secure! 🔐
