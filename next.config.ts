import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      // Add your image domains here, for example if using Firebase Storage:
      'firebasestorage.googleapis.com',
      // Add any other domains you're loading images from
    ],
  },
};

export default nextConfig;
