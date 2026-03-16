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
      {
        protocol: "https",
        hostname: "logospng.org",
      },
      {
        protocol: "https",
        hostname: "1000logos.net",
      },
      {
        protocol: "https",
        hostname: "logos-world.net",
      },
      {
        protocol: "https",
        hostname: "pngset.com",
      },
      {
        protocol: "https",
        hostname: "cdn.freelogovectors.net",
      },
      {
        protocol: "https",
        hostname: "www.pngmart.com",
      },
    ],
  },
};
module.exports = nextConfig;
