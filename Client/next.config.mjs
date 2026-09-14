/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Proxies /api/* through this same Vercel domain to the real backend,
  // rather than the browser calling the backend's own domain directly.
  // This exists specifically because Safari's Intelligent Tracking
  // Prevention blocks cross-site cookies outright, even with the
  // correct SameSite=None; Secure attributes, there is no cookie
  // configuration that works around it. Routing through this rewrite
  // means the browser only ever talks to its own origin, Vercel's edge
  // does the actual cross-origin call to the backend server-side, so the
  // session cookie becomes an ordinary first-party cookie from the
  // browser's point of view and Safari has nothing to block.
  //
  // Requires API_ORIGIN set in Vercel's environment variables (server
  // side only, deliberately not NEXT_PUBLIC_, the browser never needs to
  // know the backend's real address once this is in place).
  async rewrites() {
    const apiOrigin = process.env.API_ORIGIN;
    if (!apiOrigin) {
      console.warn("API_ORIGIN is not set, /api/* rewrite proxy is disabled.");
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
