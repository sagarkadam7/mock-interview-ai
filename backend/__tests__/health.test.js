const request = require("supertest");
const { createApp } = require("../app");

describe("health endpoint", () => {
  test(
    "GET /api/health returns ok",
    async () => {
    const app = createApp({ env: { ...process.env, FRONTEND_ORIGINS: "http://localhost:3000" } });
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
    expect(res.body).toHaveProperty("time");
    },
    20000
  );
});

