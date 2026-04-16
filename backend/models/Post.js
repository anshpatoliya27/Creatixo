import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    // ── Pro Features ──
    video: {
      type: String,
      default: ""
    },
    isAd: {
      type: Boolean,
      default: false
    },
    adVideo: {
      type: String,
      default: ""
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);