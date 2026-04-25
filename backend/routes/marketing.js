const express = require("express");

const router = express.Router();

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Newsletter signup (stub endpoint).
// In production this should forward to your email provider (Resend/Mailchimp/Brevo)
// and/or persist to a database. For now: validate and return a stable success shape.
router.post("/newsletter", (req, res) => {
  const email = req.body?.email;
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }

  // Avoid logging full PII in plain text.
  const masked = email.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => `${a}${"*".repeat(Math.min(8, b.length))}${c}`);
  console.log(`[newsletter] signup: ${masked}`);

  return res.json({ ok: true });
});

module.exports = router;

