import type { NextConfig } from "next";

const urlSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
const hostnameSupabase = urlSupabase ? new URL(urlSupabase).hostname : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: hostnameSupabase
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: hostnameSupabase,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : {},
};

export default nextConfig;
