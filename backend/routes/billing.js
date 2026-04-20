const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

function normalizePlan(input) {
  const p = String(input || "").trim().toLowerCase();
  if (p === "pro") return "pro";
  if (p === "team") return "team";
  if (p === "free") return "free";
  return null;
}

function canDevUpgrade() {
  if (String(process.env.BILLING_ALLOW_DEV_UPGRADES || "").toLowerCase() === "true") return true;
  return (process.env.NODE_ENV || "development") !== "production";
}

router.get("/me", protect, async (req, res) => {
  res.json({
    plan: req.user.plan || "free",
    planUpdatedAt: req.user.planUpdatedAt,
    usage: req.user.usage || { monthKey: "", interviewsCreated: 0 },
  });
});

// Dev-only upgrade endpoint (swap this to Stripe later).
router.post("/upgrade", protect, async (req, res, next) => {
  try {
    if (!canDevUpgrade()) {
      return res.status(403).json({ message: "Upgrades are disabled in production without billing integration." });
    }

    const plan = normalizePlan(req.body?.plan);
    if (!plan) return res.status(400).json({ message: "Invalid plan." });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { plan, planUpdatedAt: new Date() } },
      { new: true, projection: "-password" }
    );

    res.json({
      message: "Plan updated.",
      user: { _id: user._id, name: user.name, email: user.email, plan: user.plan, planUpdatedAt: user.planUpdatedAt },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

