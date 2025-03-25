/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2inr1ykkgbz5g.cloudfront.net',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'qr.sepay.vn',
        port: '',
        pathname: '/**',
      }
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    // Ignore node-specific modules when bundling for the browser
    // See https://webpack.js.org/configuration/resolve/#resolvealias
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

module.exports = nextConfig;
