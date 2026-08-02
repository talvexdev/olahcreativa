/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
  eslint: { ignoreDuringBuilds: false },
};

module.exports = nextConfig;
