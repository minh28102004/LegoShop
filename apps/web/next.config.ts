import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), "../.."),
  },
  images: {
    unoptimized: true,
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3003",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3003",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
