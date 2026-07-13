import type { NextConfig } from "next";

function toRemotePattern(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const dynamicPatterns = [
  toRemotePattern(process.env.NEXT_PUBLIC_STRAPI_URL),
  toRemotePattern(process.env.STRAPI_API_URL),
].filter(Boolean) as Array<{
  protocol: "http" | "https";
  hostname: string;
  port: string;
  pathname: string;
}>;

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "/**",
      },
      ...dynamicPatterns,
    ],
  },
};

export default nextConfig;
