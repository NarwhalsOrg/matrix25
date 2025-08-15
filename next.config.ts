import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Other config options...
  allowedDevOrigins: [
    "http://192.168.1.11",  // Specific allowed origin
    "http://localhost:3000" // Example: localhost, add more if needed
  ],
};

export default nextConfig;
