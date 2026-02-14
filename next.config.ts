import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * WHY standalone: Next.js traces only the files needed for production,
   * producing a minimal ~80MB image vs ~800MB with node_modules.
   * Required for multi-stage Docker builds.
   */
  output: "standalone",

  /** Serve food images from public/food-images/ */
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
