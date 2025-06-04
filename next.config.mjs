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
  // Netlify için özel ayarlar
  trailingSlash: false,
  // output: 'export' static site için, 'standalone' server için
  // Netlify Next.js plugin kullanırken output belirtmeye gerek yok
  
  // Hydration mismatch hatalarını azaltmak için
  experimental: {
    // suppressHydrationWarning artık experimental'da değil
  },
};

export default nextConfig;
