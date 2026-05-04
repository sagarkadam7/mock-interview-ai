const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

function parseOrigins(rawOrigins) {
  return String(rawOrigins || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCspConnectSrc(allowedOrigins) {
  const defaults = ["'self'"];
  const extra = allowedOrigins.filter((origin) => /^https?:\/\//i.test(origin));
  return [...new Set([...defaults, ...extra])];
}

function createApp({ env = process.env } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  const startedAt = Date.now();

  const allowedOrigins = parseOrigins(env.FRONTEND_ORIGINS || "http://localhost:3000");
  const cspConnectSrc = buildCspConnectSrc(allowedOrigins);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "no-referrer" },
      hsts: String(env.NODE_ENV || "").toLowerCase() === "production",
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          connectSrc: cspConnectSrc,
          imgSrc: ["'self'", "data:", "blob:"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  );

  app.use(
    compression({
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) return false;
        return compression.filter(req, res);
      },
    })
  );
  app.use(cookieParser());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("CORS origin not allowed"));
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
    const version = String(env.APP_VERSION || env.npm_package_version || "").trim() || undefined;
    res.json({
      ok: true,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      time: new Date().toISOString(),
      ...(version ? { version } : {}),
    });
  });

  app.get("/", (req, res) =>
    res.json({ message: "Mock Interview API running.", ok: true, time: new Date().toISOString() })
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
    if (err.message === "CORS origin not allowed") {
      return res.status(403).json({ message: "Origin not allowed." });
    }
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ message: err.message || "Server error." });
  });

  return app;
}

module.exports = { createApp };
