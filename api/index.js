const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Proxy server is running");
});

app.use("/proxy", (req, res, next) => {
  console.log(`[PROXY] ${req.method} ${req.originalUrl}`);
  const target = "http://ec2-3-8-134-165.eu-west-2.compute.amazonaws.com:8000";

  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      "^/proxy": "/api/v1", // this replaces /proxy with /api/v1
    },
    onProxyReq(proxyReq, req) {
      console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${target}${req.url}`);
    },
    onError(err, req, res) {
      console.error("Proxy error:", err.message);
      res.status(500).json({ error: "Proxy error", details: err.message });
    },
  });
  console.log(`[PROXY] ${req.method} ${req.originalUrl} -> ${target}${req.url}`);

  return proxy(req, res, next);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy running at http://localhost:${PORT}`);
});
