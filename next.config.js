/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build (temporary)
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build (temporary)
  },
  /**  Turbopack 설정
  turbopack: {
    root: __dirname,
  },**/
};

module.exports = nextConfig;
