import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import { validateEmail, validatePassword, validateName, sanitize } from "../middleware/validation.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// ✅ Google client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* REGISTER - with validation */
router.post("/register", async (req, res) => {
  try {
    let { name, email, password, avatar } = req.body;

    // ✅ Input validation
    if (!name || !email || !password || !avatar) {
      return res.status(400).json({ message: "All fields (name, email, password, avatar) are required" });
    }

    name = sanitize(name);
    email = sanitize(email).toLowerCase();

    if (!validateName(name)) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email is invalid" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      provider: "local"
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    });

  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
});

/* LOGIN - with validation */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // ✅ Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = sanitize(email).toLowerCase();

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Prevent Google-only users from password login
    if (!user.password) {
      return res.status(400).json({ message: "Please use Google Login for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});


// ✅ GOOGLE LOGIN / SIGNUP - with validation
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // ✅ Verify token with Google
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (err) {
      console.error("Google token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid Google token" });
    }

    if (!ticket) {
      return res.status(401).json({ message: "Token verification failed" });
    }

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // ✅ Validate email exists
    if (!email) {
      return res.status(400).json({ message: "Google account must have an email" });
    }

    const normalizedEmail = email.toLowerCase();

    // ✅ Check if user exists
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // New Google user - redirect to complete profile
      return res.json({ isNewUser: true, email: normalizedEmail });
    }

    // Existing user - login
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: jwtToken,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(500).json({ message: "Google authentication failed. Please try again." });
  }
});

// ✅ Complete profile for new Google users - with validation
router.post("/complete-profile", async (req, res) => {
  try {
    let { name, email, password, avatar } = req.body;

    // ✅ Input validation
    if (!name || !email || !password || !avatar) {
      return res.status(400).json({ message: "All fields are required" });
    }

    name = sanitize(name);
    email = sanitize(email).toLowerCase();
    password = sanitize(password);

    if (!validateName(name)) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email is invalid" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatar,
      provider: "google"
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error("Complete profile error:", error.message);
    res.status(500).json({ message: "Profile completion failed. Please try again." });
  }
});

// ✅ EXAMPLE: Protected route using auth middleware
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

export default router;