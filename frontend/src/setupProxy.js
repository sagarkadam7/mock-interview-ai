const { createProxyMiddleware } = require("http-proxy-middleware");

/** Dev only: forward /api to the backend. Avoids proxying /favicon.ico and other static paths. */
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5001",
      changeOrigin: true,
    })
  );
};
