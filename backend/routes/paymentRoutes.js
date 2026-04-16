import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { sendProActivationEmail } from "../utils/sendEmail.js";

const router = express.Router();

// ── Initialize Razorpay ──
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Plan Configuration ──
const PLAN_CONFIG = {
  pro_monthly: { amount: 1900, currency: "INR", label: "Pro Monthly", durationDays: 30 },
  pro_annual: { amount: 15000, currency: "INR", label: "Pro Annual", durationDays: 365 },
  enterprise_monthly: { amount: 9900, currency: "INR", label: "Enterprise Monthly", durationDays: 30 },
  enterprise_annual: { amount: 79000, currency: "INR", label: "Enterprise Annual", durationDays: 365 },
};

// ──────────────────────────────────────────────
// POST /api/payment/create-order
// Creates a Razorpay order for the selected plan
// ──────────────────────────────────────────────
router.post("/create-order", verifyToken, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLAN_CONFIG[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const config = PLAN_CONFIG[plan];

    const options = {
      amount: config.amount * 100, // Razorpay expects paise (INR) / cents (USD)
      currency: config.currency,
      receipt: `creatixo_${plan}_${Date.now()}`,
      notes: {
        userId: req.user.id,
        plan: plan,
        planLabel: config.label,
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
      plan: config,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// ──────────────────────────────────────────────
// POST /api/payment/verify
// Verifies payment signature and activates Pro
// ──────────────────────────────────────────────
router.post("/verify", verifyToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    // Step 1: Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed — invalid signature" });
    }

    // Step 2: Get plan config
    const config = PLAN_CONFIG[plan];
    if (!config) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    // Step 3: Update user to Pro
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.durationDays);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        isPro: true,
        proPlan: plan,
        proExpiresAt: expiresAt,
        proActivatedAt: new Date(),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        $push: {
          paymentHistory: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: config.amount,
            currency: config.currency,
            plan: plan,
            status: "paid",
            paidAt: new Date(),
          },
        },
      },
      { new: true }
    ).select("-password");

    // Step 4: Send confirmation email
    try {
      await sendProActivationEmail(user, {
        plan,
        amount: config.amount,
        currency: config.currency,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });
    } catch (emailErr) {
      console.error("Email failed but payment succeeded:", emailErr.message);
    }

    // Step 5: Return updated user
    res.status(200).json({
      success: true,
      message: "Payment verified & Pro plan activated!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isPro: user.isPro,
        proPlan: user.proPlan,
        proExpiresAt: user.proExpiresAt,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

// ──────────────────────────────────────────────
// GET /api/payment/status
// Returns current user's subscription status
// ──────────────────────────────────────────────
router.get("/status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("isPro proPlan proExpiresAt proActivatedAt paymentHistory");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Auto-expire if past date
    if (user.isPro && user.proExpiresAt && new Date() > new Date(user.proExpiresAt)) {
      user.isPro = false;
      user.proPlan = "none";
      await user.save();
    }

    res.json({
      isPro: user.isPro,
      proPlan: user.proPlan,
      proExpiresAt: user.proExpiresAt,
      proActivatedAt: user.proActivatedAt,
      paymentHistory: user.paymentHistory,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ message: "Failed to check subscription status" });
  }
});

export default router;
