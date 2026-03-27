import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use a custom loader for Cloudflare Images (configured in Phase 4).
  // For now, 'unoptimized' allows the build to succeed without a loader file.
  // Switch to loader: 'custom' + loaderFile in Phase 4.
  images: {
    unoptimized: true,
  },

  // Ensure Next.js does not produce a standalone output.
  // OpenNext Cloudflare handles the build transformation itself.

  // MDX support will be configured in Phase 1 when next-mdx-remote is wired up.
};

export default nextConfig;
