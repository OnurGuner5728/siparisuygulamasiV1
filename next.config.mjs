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
};

export default nextConfig;
