import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //output: "standalone",
  serverExternalPackages: ["@prisma/client"],
  async rewrites() {
    return [
      {
        source: "/js/script.js",
        destination: "https://datafa.st/js/script.js",
      },
      {
        source: "/api/events",
        destination: "https://datafa.st/api/events",
      },
    ];
  },
};

export default nextConfig;
