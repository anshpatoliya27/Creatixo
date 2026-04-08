import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// ── TOGGLE save/unsave a post ──
router.post("/toggle/:postId", verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadySaved = user.savedPosts.includes(postId);

    if (alreadySaved) {
      // Unsave
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== postId
      );
      await user.save();
      res.json({ message: "Post unsaved", saved: false, savedPosts: user.savedPosts });
    } else {
      // Save
      user.savedPosts.push(postId);
      await user.save();
      res.json({ message: "Post saved", saved: true, savedPosts: user.savedPosts });
    }
  } catch (error) {
    console.error("Toggle save error:", error.message);
    res.status(500).json({ message: "Failed to toggle save" });
  }
});

// ── GET all saved posts (populated) ──
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: "savedPosts",
        populate: {
          path: "user",
          select: "name avatar"
        }
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out any null posts (in case a saved post was deleted)
    const validPosts = user.savedPosts.filter((p) => p !== null);

    res.json({ savedPosts: validPosts });
  } catch (error) {
    console.error("Get saved posts error:", error.message);
    res.status(500).json({ message: "Failed to fetch saved posts" });
  }
});

// ── GET saved post IDs only (lightweight, for checking save state) ──
router.get("/ids", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("savedPosts");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ savedPostIds: user.savedPosts });
  } catch (error) {
    console.error("Get saved IDs error:", error.message);
    res.status(500).json({ message: "Failed to fetch saved post IDs" });
  }
});

export default router;
