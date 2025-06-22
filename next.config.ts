import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use stable Turbopack configuration
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js"],
  },
};

export default nextConfig;
