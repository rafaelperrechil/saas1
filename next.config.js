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
    // Habilitar server actions
    serverActions: {
      enabled: true,
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
