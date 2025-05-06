/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    // Ativar otimizações do SWC
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Otimizações de imagem
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Cache melhorado para desenvolvimento
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/home',
      },
    ];
  },
};

module.exports = nextConfig;
