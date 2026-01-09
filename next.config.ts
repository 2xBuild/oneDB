import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Allow all HTTPS image URLs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // Disable optimization - images load directly in browser (no server-side requests)
    // This eliminates SSRF risk but you lose automatic optimization/resizing
    unoptimized: true,
  },
};

export default nextConfig;
