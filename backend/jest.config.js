module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  clearMocks: true,
  collectCoverageFrom: ["app.js", "routes/**/*.js", "middleware/**/*.js", "utils/**/*.js", "!**/node_modules/**"],
};

