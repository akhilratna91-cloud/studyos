import path from "node:path";
import type { NextConfig } from "next";

const internalApiOrigin = (
  process.env.INTERNAL_API_ORIGIN || "http://127.0.0.1:5000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${internalApiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
