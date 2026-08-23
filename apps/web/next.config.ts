import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD ? "standalone" : undefined,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@ioma/ui", "@ioma/config", "@ioma/types", "@ioma/validation"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const isDocker = process.env.NODE_ENV === "production" || !!process.env.INTERNAL_API_URL;
    const defaultApi = isDocker ? "http://api:4000" : "http://localhost:4000";
    const apiTarget = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || defaultApi;
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
