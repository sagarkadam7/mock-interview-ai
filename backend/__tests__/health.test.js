const request = require("supertest");
const { createApp } = require("../app");

const mockMongoOk = () => ({ ok: true, state: "connected" });

describe("health endpoint", () => {
  test(
    "GET /api/health returns ok when mongo is connected",
    async () => {
      const app = createApp({
        env: { ...process.env, FRONTEND_ORIGINS: "http://localhost:3000" },
        getMongoHealth: mockMongoOk,
      });
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("ok", true);
      expect(res.body).toHaveProperty("mongo", "connected");
      expect(res.body).toHaveProperty("time");
      expect(res.body).toHaveProperty("uptimeSec");
    },
    60000
  );

  test(
    "GET /api/health returns 503 when mongo is disconnected",
    async () => {
      const app = createApp({
        env: { ...process.env, FRONTEND_ORIGINS: "http://localhost:3000" },
        getMongoHealth: () => ({ ok: false, state: "disconnected" }),
      });
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({ ok: false, mongo: "disconnected" });
    },
    60000
  );

  test(
    "GET /api/health includes version when APP_VERSION is set",
    async () => {
      const app = createApp({
        env: { ...process.env, FRONTEND_ORIGINS: "http://localhost:3000", APP_VERSION: "test-1.2.3" },
        getMongoHealth: mockMongoOk,
      });
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ ok: true, version: "test-1.2.3" });
    },
    60000
  );
});
