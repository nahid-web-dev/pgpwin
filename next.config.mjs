/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sc4-admin.dreamgates.net",
      },
      {
        protocol: "https",
        hostname: "contents.static-slotcity.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "m2-games-stg.s3.ap-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "sit-ts-files.s3.ap-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "mgmt-stg.hacksawgaming.com",
      },
      {
        protocol: "https",
        hostname: "asset.dstplay.cc",
      },
    ],
  },
};

export default nextConfig;
