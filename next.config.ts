import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "*.localhost",
    "lvh.me",
    "*.lvh.me",
    "10.137.41.20",
    "192.168.1.5",
  ],
};

export default nextConfig;
