import express from "express";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

console.log('Loading postRoutes...');
console.log('Using Cloudinary:', cloudinary.config().cloud_name ? 'configured' : 'missing config');

const router = express.Router();

// GET ALL POSTS
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    const posts = await Post.find(query).populate('user', 'name avatar');
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// CREATE POST
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log('POST /api/posts request body:', req.body);
    const { title, description, category, image } = req.body;

    let imageUrl = null;

    if (image) {
      const result = await cloudinary.uploader.upload(image, {
        folder: 'posts'
      });
      console.log('Cloudinary upload result:', result);
      imageUrl = result.secure_url;
    }

    const newPost = new Post({
      title,
      description,
      category,
      image: imageUrl,
      user: req.user.id
    });

    await newPost.save();
    console.log('Saved post:', newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    res.status(500).json({ message: "Error creating post" });
  }
});

// DELETE POST (only owner)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

export default router;