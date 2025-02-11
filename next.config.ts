import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'raw.githubusercontent.com',
      'github.com'
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
