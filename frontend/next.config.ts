import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5003',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'axon-ecosystem.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

