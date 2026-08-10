import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { ProxyOptions } from "vite";

function yahooProxy(): ProxyOptions {
  return {
    target: "https://query1.finance.yahoo.com",
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/yahoo/, ""),
    configure: (proxy) => {
      proxy.on("proxyReq", (proxyReq) => {
        proxyReq.setHeader(
          "User-Agent",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        );
        proxyReq.setHeader("Accept", "application/json,text/plain,*/*");
      });
    },
  };
}

export default defineConfig({
  base: "/agentic-trader/",
  plugins: [react()],
  server: {
    proxy: {
      "/api/yahoo": yahooProxy(),
    },
  },
  preview: {
    proxy: {
      "/api/yahoo": yahooProxy(),
    },
  },
});
