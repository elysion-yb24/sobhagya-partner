/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    experimental: {
      outputFileTracingRoot: __dirname,
    },
    images: {
      unoptimized: true,
    },
    output: "standalone",
  };
  
  module.exports = nextConfig;
  