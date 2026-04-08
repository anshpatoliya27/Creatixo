import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { verifyToken } from "../middleware/auth.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ── GET own profile (authenticated) ──
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar");

    const totalPosts = posts.length;

    res.json({
      user,
      posts,
      stats: {
        totalPosts,
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ── GET public profile by user ID ──
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "name avatar");

    const totalPosts = posts.length;

    res.json({
      user,
      posts,
      stats: {
        totalPosts,
        memberSince: user.createdAt
      }
    });
  } catch (error) {
    console.error("Get public profile error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ── UPDATE profile (authenticated) ──
router.put("/update", verifyToken, async (req, res) => {
  try {
    const {
      name,
      bio,
      description,
      avatar,
      coverImage,
      location,
      website,
      phone,
      businessName,
      businessType,
      businessEmail,
      industry,
      foundedYear,
      socialLinks
    } = req.body;

    const updateData = {};

    // Basic fields
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (phone !== undefined) updateData.phone = phone;

    // Business fields
    if (businessName !== undefined) updateData.businessName = businessName;
    if (businessType !== undefined) updateData.businessType = businessType;
    if (businessEmail !== undefined) updateData.businessEmail = businessEmail;
    if (industry !== undefined) updateData.industry = industry;
    if (foundedYear !== undefined) updateData.foundedYear = foundedYear;

    // Social links
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    // Handle avatar upload to Cloudinary
    if (avatar && avatar.startsWith("data:")) {
      try {
        const result = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" }
          ]
        });
        updateData.avatar = result.secure_url;
      } catch (uploadErr) {
        console.error("Avatar upload error:", uploadErr.message);
        return res.status(400).json({ message: "Failed to upload avatar" });
      }
    } else if (avatar) {
      updateData.avatar = avatar;
    }

    // Handle cover image upload to Cloudinary
    if (coverImage && coverImage.startsWith("data:")) {
      try {
        const result = await cloudinary.uploader.upload(coverImage, {
          folder: "covers",
          transformation: [
            { width: 1200, height: 400, crop: "fill" }
          ]
        });
        updateData.coverImage = result.secure_url;
      } catch (uploadErr) {
        console.error("Cover upload error:", uploadErr.message);
        return res.status(400).json({ message: "Failed to upload cover image" });
      }
    } else if (coverImage) {
      updateData.coverImage = coverImage;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update localStorage-compatible response
    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Profile update failed" });
  }
});

export default router;
