import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'raw.githubusercontent.com',
      'github.com',
      '91.216.104.8',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/Mhmk1399/storadge/main/images/**'
      }
    ]
  },
};

export default nextConfig;
