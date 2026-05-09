const AuditLog = require("../models/AuditLog");

function extractIp(req) {
  if (!req) return "";
  const xff = req.headers?.["x-forwarded-for"];
  const first =
    typeof xff === "string"
      ? xff.split(",")[0]?.trim()
      : Array.isArray(xff)
        ? String(xff[0] || "").split(",")[0]?.trim()
        : "";
  return (
    first ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    ""
  );
}

async function logAction(userId, action, details, req) {
  try {
    if (!action || typeof action !== "string") return;

    const entry = new AuditLog({
      userId: userId || null,
      action: action.trim().slice(0, 80),
      details: details && typeof details === "object" ? details : {},
      ipAddress: extractIp(req),
      timestamp: new Date(),
    });

    await entry.save();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Audit log write failed:", {
      requestId: req?.requestId,
      action,
      message: err?.message,
    });
  }
}

module.exports = { logAction };

