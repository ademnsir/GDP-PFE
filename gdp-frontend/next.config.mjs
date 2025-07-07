/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Add this line to enable static export
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: "/**",
      }
    ],
    domains: ['localhost', 'lh3.googleusercontent.com'],
    unoptimized: true,
  },
};

export default nextConfig;
