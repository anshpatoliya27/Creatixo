import express from "express";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// GET all liked posts for authenticated user
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "likedPosts",
      populate: { path: "user", select: "name avatar" }
    });

    res.json({ likedPosts: user.likedPosts });
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    res.status(500).json({ message: "Error fetching liked posts" });
  }
});

// GET array of liked post IDs
router.get("/ids", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ likedPostIds: user.likedPosts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching liked post IDs" });
  }
});

// TOGGLE LIKE POST
router.post("/toggle/:postId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.postId;

    let liked = false;
    const index = user.likedPosts.findIndex(id => id.toString() === postId.toString());
    
    if (index === -1) {
      user.likedPosts.push(postId);
      liked = true;
    } else {
      user.likedPosts.splice(index, 1);
    }

    await user.save();
    res.json({ message: "Success", liked, likedPosts: user.likedPosts });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
});

export default router;
