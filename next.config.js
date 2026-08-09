/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Align with lib/cloudinary/variants.ts caps — avoids extra Cloudinary derivatives.
    deviceSizes: [640, 800, 1080, 1920, 2000],
    imageSizes: [200, 224, 400, 640],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
};

module.exports = nextConfig;
