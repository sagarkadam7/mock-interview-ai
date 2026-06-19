const { createCorsOriginChecker, parseOrigins } = require("../app");

describe("CORS origin checker", () => {
  test("allows configured origins", (done) => {
    const checker = createCorsOriginChecker(["http://localhost:3000"], { isProduction: false });
    checker("http://localhost:3000", (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
      done();
    });
  });

  test("allows localhost in non-production", (done) => {
    const checker = createCorsOriginChecker([], { isProduction: false });
    checker("http://localhost:5173", (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
      done();
    });
  });

  test("rejects unknown origins in production", (done) => {
    const checker = createCorsOriginChecker(["https://app.example.com"], { isProduction: true });
    checker("https://evil.example.com", (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("CORS origin not allowed");
      done();
    });
  });

  test("allows Render static site origins in production", (done) => {
    const checker = createCorsOriginChecker([], { isProduction: true });
    checker("https://interviewai-web-h2ht.onrender.com", (err, allowed) => {
      expect(err).toBeNull();
      expect(allowed).toBe(true);
      done();
    });
  });
});

describe("parseOrigins", () => {
  test("splits comma-separated origins", () => {
    expect(parseOrigins("http://a.test, https://b.test")).toEqual(["http://a.test", "https://b.test"]);
  });
});
