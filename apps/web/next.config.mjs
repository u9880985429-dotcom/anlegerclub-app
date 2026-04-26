/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@traderiq/api", "@traderiq/db", "@traderiq/ui"],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
