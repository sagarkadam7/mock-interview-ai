const express = require("express");
const AuditLog = require("../models/AuditLog");
const { protect } = require("../middleware/auth");

const router = express.Router();

function parseAdminEmails(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function requireAdmin(req, res, next) {
  const allowed = parseAdminEmails(process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL);
  if (!allowed.length) {
    return res.status(403).json({ message: "Admin access is not configured." });
  }
  const email = String(req.user?.email || "").trim().toLowerCase();
  if (!email || !allowed.includes(email)) {
    return res.status(403).json({ message: "Not authorized." });
  }
  next();
}

// GET /api/admin/audit-logs?limit=200&skip=0
router.get("/audit-logs", protect, requireAdmin, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 200));
    const skip = Math.max(0, Number(req.query.skip) || 0);

    const logs = await AuditLog.find({})
      .sort({ timestamp: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ logs, limit, skip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

