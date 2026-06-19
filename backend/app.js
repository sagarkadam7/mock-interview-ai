const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

function parseOrigins(rawOrigins) {
  return String(rawOrigins || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

/** Render static sites use https://<service-name>.onrender.com */
function isRenderHostedOrigin(origin) {
  return /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(String(origin || "").trim());
}

function buildCspConnectSrc(allowedOrigins) {
  const defaults = ["'self'"];
  const extra = allowedOrigins.filter((origin) => /^https?:\/\//i.test(origin));
  const renderWildcard = "https://*.onrender.com";
  return [...new Set([...defaults, ...extra, renderWildcard])];
}

function createCorsOriginChecker(allowedOrigins, { isProduction = false } = {}) {
  const allowed = new Set(allowedOrigins.map((o) => String(o).trim().replace(/\/$/, "")));
  return (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = String(origin).trim().replace(/\/$/, "");
    if (allowed.has(normalized)) return callback(null, true);
    if (isProduction && isRenderHostedOrigin(normalized)) return callback(null, true);
    if (
      !isProduction &&
      (/^http:\/\/localhost:\d+$/i.test(normalized) || /^http:\/\/127\.0\.0\.1:\d+$/i.test(normalized))
    ) {
      return callback(null, true);
    }
    callback(new Error("CORS origin not allowed"));
  };
}

function defaultMongoHealth() {
  try {
    const mongoose = require("mongoose");
    const connected = mongoose.connection.readyState === 1;
    return { ok: connected, state: connected ? "connected" : "disconnected" };
  } catch {
    return { ok: false, state: "unknown" };
  }
}

function createApp({ env = process.env, getMongoHealth = defaultMongoHealth } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  const startedAt = Date.now();

  app.use((req, res, next) => {
    const incoming = req.headers["x-request-id"];
    const requestId =
      (typeof incoming === "string" && incoming.trim().slice(0, 128)) ||
      (Array.isArray(incoming) && String(incoming[0] || "").trim().slice(0, 128)) ||
      crypto.randomBytes(12).toString("hex");
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
  });

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

  const isProduction = String(env.NODE_ENV || "").toLowerCase() === "production";
  app.use(
    cors({
      origin: createCorsOriginChecker(allowedOrigins, { isProduction }),
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
  app.use("/api/admin", require("./routes/admin"));
  app.use("/api/marketing", require("./routes/marketing"));
  app.use("/api/marketing", require("./routes/clientError"));

  app.get("/api/health", (req, res) => {
    const version = String(env.APP_VERSION || env.npm_package_version || "").trim() || undefined;
    const mongo = getMongoHealth();
    const body = {
      ok: mongo.ok,
      mongo: mongo.state,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      time: new Date().toISOString(),
      ...(version ? { version } : {}),
    };
    res.status(mongo.ok ? 200 : 503).json(body);
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
    console.error("Unhandled error:", { requestId: req.requestId, message: err?.message, stack: err?.stack });
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ message: err.message || "Server error.", requestId: req.requestId });
  });

  return app;
}

module.exports = {
  createApp,
  parseOrigins,
  buildCspConnectSrc,
  createCorsOriginChecker,
  defaultMongoHealth,
  isRenderHostedOrigin,
};
