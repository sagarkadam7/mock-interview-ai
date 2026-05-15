const request = require("supertest");
const { createApp } = require("../app");

const baseEnv = { FRONTEND_ORIGINS: "http://localhost:3000" };

describe("prep brief route", () => {
  test(
    "POST /api/interview/:id/prep-brief without auth returns 401",
    async () => {
      const app = createApp({ env: { ...process.env, ...baseEnv } });
      const res = await request(app).post("/api/interview/507f1f77bcf86cd799439011/prep-brief");
      expect(res.status).toBe(401);
    },
    60000
  );
});
