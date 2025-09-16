import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'raw.githubusercontent.com',
      'github.com',
      '91.216.104.8',
      'localhost',
      '*',
      'disk-9ddcd5133c-mamad.apps.ir-central1.arvancaas.ir',
      'dashboard-image.s3.ir-thr-at1.arvanstorage.ir'
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
