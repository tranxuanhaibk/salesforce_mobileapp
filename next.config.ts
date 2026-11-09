import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable .next/lock file creation during `next build` to prevent
    // Vercel's post-build output collector from hitting ENOENT on `/vercel/path0/.next/lock`
    lockDistDir: false,
  },
};

export default nextConfig;
