const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    action: { type: String, required: true, trim: true, index: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { minimize: false }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);

