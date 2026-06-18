const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { createApp } = require("./app");

dotenv.config();

const PORT = process.env.PORT || 5001;

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not set. Copy backend/.env.example to backend/.env and configure MongoDB.");
  process.exit(1);
}

const jwtSecret = String(process.env.JWT_SECRET || "").trim();
if (jwtSecret.length < 32) {
  console.error(
    "❌ JWT_SECRET must be at least 32 characters. Copy backend/.env.example to backend/.env and set a long random string."
  );
  process.exit(1);
}

const app = createApp();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, closing…`);
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log("MongoDB connection closed");
          process.exit(0);
        });
      });
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
