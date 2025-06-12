import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ngwajwzrsfiwjbsfjucc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  eslint: {
    // Vercelデプロイ時にESLintエラーを無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 型エラーもVercelデプロイ時には無視（開発時は有効）
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
