/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Only run ESLint on specific commands
    ignoreDuringBuilds: process.env.DISABLE_ESLINT_PLUGIN === 'true',
  },
  typescript: {
    // Allow production builds with type issues during development
    ignoreBuildErrors: process.env.DISABLE_ESLINT_PLUGIN === 'true',
  }
};

export default nextConfig;