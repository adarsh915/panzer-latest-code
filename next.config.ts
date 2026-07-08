import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ['mysql2'],
  
  // Performance optimizations
  // optimizeFonts: true, // Invalid top-level config, fonts are optimized by default
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  experimental: {
    optimizeCss: true, // ✅ ENABLED: Inlines critical CSS with Critters (prevents FOUC)
    serverActions: {
      bodySizeLimit: '64mb',
    },
  },
  
  images: {
    // Frontend uses plain <img> tags from the legacy template, unoptimized is needed
    unoptimized: true,
  },
  
  transpilePackages: ['jodit', 'jodit-react'],
  devIndicators: false,
};

export default nextConfig;
