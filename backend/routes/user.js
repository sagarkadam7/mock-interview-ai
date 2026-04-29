const express = require("express");
const Interview = require("../models/Interview");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Export user data for portability.
router.get("/export", protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id }).sort("-createdAt");
    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        plan: req.user.plan,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
      interviews,
      exportedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Export failed." });
  }
});

// Delete account and all associated data.
router.delete("/me", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    await Interview.deleteMany({ userId });
    await User.deleteOne({ _id: userId });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message || "Delete failed." });
  }
});

module.exports = router;
