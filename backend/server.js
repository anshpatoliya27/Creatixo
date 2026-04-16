import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: './.env' });

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
connectDB();

const app = express();

// ✅ Security: Helmet - set secure HTTP headers
app.use(helmet());

// ✅ Security: Rate limiting for general API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

// ✅ Security: Strict rate limiting for authentication routes (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 auth attempts per minute
  message: "Too many login attempts. Please try again in 1 minute.",
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false
});

// ✅ Apply general rate limiting to all routes
app.use(generalLimiter);

// ✅ Security: CORS restricted to frontend URL only
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ✅ Body parsing - secure with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Routes with rate limiting
app.use("/api/auth", authLimiter, authRoutes); // Strict limit on auth
app.use("/api/posts", postRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Creatixo API Running");
});

// ✅ Error handling middleware (catches 404, etc)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy, trying port ${PORT + 1}...`);
    server.listen(PORT + 1, () => {
      console.log(`Server running on port ${PORT + 1}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } else {
    console.error('Server error:', err);
  }
});