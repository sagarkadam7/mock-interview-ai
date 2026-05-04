const request = require("supertest");
const { createApp } = require("../app");

const baseEnv = { FRONTEND_ORIGINS: "http://localhost:3000" };

describe("app routes", () => {
  test(
    "GET / returns JSON with ok true",
    async () => {
      const app = createApp({ env: { ...process.env, ...baseEnv } });
      const res = await request(app).get("/");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ ok: true });
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("time");
    },
    60000
  );

  test(
    "GET /api/missing returns 404 JSON",
    async () => {
      const app = createApp({ env: { ...process.env, ...baseEnv } });
      const res = await request(app).get("/api/does-not-exist-xyz");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Not found." });
    },
    60000
  );
});
