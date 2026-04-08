// ✅ EXAMPLE: Protected Routes with Auth Middleware
// Since your /api/posts route needs protection, use this pattern:

import express from "express";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// ✅ All post routes protected with auth middleware
router.use(verifyToken);

// ✅ Example: Get all posts (protected)
router.get("/", async (req, res) => {
  try {
    // User is authenticated (req.user contains user ID)
    res.json({ message: "Posts fetched successfully", userId: req.user.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
});

// ✅ Example: Create a new post (protected)
router.post("/", async (req, res) => {
  try {
    // User is authenticated, can create post
    const userId = req.user.id;
    res.status(201).json({ message: "Post created successfully", userId });
  } catch (error) {
    res.status(500).json({ message: "Failed to create post" });
  }
});

// ✅ Example: Delete a post (protected)
router.delete("/:id", async (req, res) => {
  try {
    // Only authenticated users can delete
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete post" });
  }
});

export default router;
