const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { createApp } = require("./app");

dotenv.config();

const app = createApp();

const PORT = process.env.PORT || 5000;

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
