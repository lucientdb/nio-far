import type { NextConfig } from "next";

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND}/api/:path*`,
      },
      {
        source: "/static/:path*",
        destination: `${BACKEND}/static/:path*`,
      },
    ];
  },
};

export default nextConfig;
