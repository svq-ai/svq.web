import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!process.env.BACKEND_URL) {
      return [];
    }
    return [
      {
        source: "/api/:slug*",
        destination: process.env.BACKEND_URL + "/:slug*",
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
