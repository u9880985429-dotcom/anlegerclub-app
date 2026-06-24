/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@traderiq/api", "@traderiq/db", "@traderiq/ui"],
  experimental: {
    typedRoutes: false,
    // Tree-shaked Icon-Importe statt Barrel-Import — spuerbar kleineres Client-Bundle.
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
