const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true, // If you want to skip TypeScript errors during builds
    },
    experimental: {
        appDir: true, // Ensure it's using Next.js app directory correctly
    },
    output: "standalone",
};

module.exports = nextConfig;
