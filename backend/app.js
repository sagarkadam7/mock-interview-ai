const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

function createApp({ env = process.env } = {}) {
  const app = express();
  app.set("trust proxy", 1);
  const startedAt = Date.now();

  const rawOrigins = env.FRONTEND_ORIGINS || "http://localhost:3000";
  const allowedOrigins = rawOrigins
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
    })
  );
  app.use(compression());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        return callback(null, allowedOrigins.includes(origin));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(env.API_RATE_LIMIT_MAX) || 500,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(env.AUTH_RATE_LIMIT_MAX) || 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Try again in a few minutes." },
  });

  app.use("/api", apiLimiter);
  app.use("/api/auth", authLimiter, require("./routes/auth"));
  app.use("/api/billing", require("./routes/billing"));
  app.use("/api/interview", require("./routes/interview"));
  app.use("/api/share", require("./routes/share"));
  app.use("/api/marketing", require("./routes/marketing"));
  app.use("/api/marketing", require("./routes/clientError"));

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      time: new Date().toISOString(),
    });
  });

  app.get("/", (req, res) =>
    res.json({ message: "Mock Interview API running ✅", ok: true, time: new Date().toISOString() })
  );

  app.use((req, res) => {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ message: "Not found." });
    }
    res.status(404).type("text").send("Not found");
  });

  app.use((err, req, res, next) => {
    if (err.name === "MulterError") {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large (max 5MB)."
          : err.message || "Upload failed.";
      return res.status(400).json({ message: msg });
    }
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ message: err.message || "Server error." });
  });

  return app;
}

module.exports = { createApp };

