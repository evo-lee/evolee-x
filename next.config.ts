import type { NextConfig } from 'next';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,

  async rewrites() {
    return [
      {
        source: '/:locale(en|zh-CN)',
        destination: '/?__locale=:locale',
      },
      {
        source: '/:locale(en|zh-CN)/:path*',
        destination: '/:path*?__locale=:locale',
      },
    ];
  },

  images: {
    loader: 'custom',
    loaderFile: './lib/cloudflare/loader.ts',
  },

  // Ensure Next.js does not produce a standalone output.
  // OpenNext Cloudflare handles the build transformation itself.

  // MDX support will be configured in Phase 1 when next-mdx-remote is wired up.
};

export default nextConfig;
