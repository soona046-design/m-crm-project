/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'date-fns/_lib/format/longFormatters': 'date-fns/esm/_lib/format/longFormatters',
    };
    return config;
  },
  /**  Turbopack 설정
  turbopack: {
    root: __dirname,
  },**/
};

module.exports = nextConfig;
