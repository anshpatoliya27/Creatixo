import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: false
    },
    avatar: {
      type: String
    },
    provider: {
      type: String,
      default: "local"
    },
    // ── Profile Fields ──
    bio: {
      type: String,
      default: "",
      maxlength: 160
    },
    description: {
      type: String,
      default: "",
      maxlength: 500
    },
    coverImage: {
      type: String,
      default: ""
    },
    location: {
      type: String,
      default: ""
    },
    website: {
      type: String,
      default: ""
    },
    phone: {
      type: String,
      default: ""
    },
    // ── Business Info ──
    businessName: {
      type: String,
      default: ""
    },
    businessType: {
      type: String,
      default: ""
    },
    businessEmail: {
      type: String,
      default: ""
    },
    industry: {
      type: String,
      default: ""
    },
    foundedYear: {
      type: String,
      default: ""
    },
    // ── Saved Posts ──
    savedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }],
    // ── Liked Posts ──
    likedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }],
    // ── Social Links ──
    socialLinks: {
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" }
    },
    // ── Pro Subscription ──
    isPro: {
      type: Boolean,
      default: false
    },
    proPlan: {
      type: String,
      enum: ["none", "pro_monthly", "pro_annual", "enterprise_monthly", "enterprise_annual"],
      default: "none"
    },
    proExpiresAt: {
      type: Date,
      default: null
    },
    proActivatedAt: {
      type: Date,
      default: null
    },
    razorpayOrderId: {
      type: String,
      default: ""
    },
    razorpayPaymentId: {
      type: String,
      default: ""
    },
    paymentHistory: [{
      orderId: String,
      paymentId: String,
      amount: Number,
      currency: String,
      plan: String,
      status: String,
      paidAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);