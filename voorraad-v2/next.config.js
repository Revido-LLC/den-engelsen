/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.denengelsen.eu",
      },
      {
        protocol: "https",
        hostname: "denengelsentopused.eu",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};
module.exports = nextConfig;
