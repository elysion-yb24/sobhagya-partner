/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        outputFileTracingRoot: __dirname, // Helps prevent infinite loops
    },
    images: {
        unoptimized: true, // Skips Next.js image optimization (useful for Azure/Cloudinary)
    },
    output: "standalone",
};

module.exports = nextConfig;
