/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Netlify build esnasında ESLint hatalarını görmezden gelecek
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Typescript hatalarını da görmezden gelmek için
    ignoreBuildErrors: true,
  },
  // Development'ta double rendering'i önlemek için (production'da zaten kapalı)
  reactStrictMode: false,
  // External packages to transpile
  transpilePackages: ['react-icons'],
  // External image hostnames için
  images: {
    domains: [
      'via.placeholder.com',
      'ozqsbbngkkssstmaktou.supabase.co'
    ],
  },
};

export default nextConfig;
