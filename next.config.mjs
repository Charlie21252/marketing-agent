/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build go to a separate folder so it doesn't clash with a running dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: {
    // Playwright is optional and loaded at runtime; don't try to bundle it.
    serverComponentsExternalPackages: ['playwright'],
  },
};

export default nextConfig;
