const express = require("express");

const router = express.Router();

// Minimal client error collector.
// In production, forward to Sentry/Datadog/Logtail instead of logging.
router.post("/client-error", (req, res) => {
  const body = req.body || {};
  const safe = {
    requestId: req.requestId,
    type: body.type,
    message: body.message,
    source: body.source,
    lineno: body.lineno,
    colno: body.colno,
    href: body.href,
    ts: body.ts,
  };
  console.warn("[client-error]", safe);
  return res.json({ ok: true, requestId: req.requestId });
});

module.exports = router;
