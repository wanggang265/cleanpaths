/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Static export: emit out/<route>/index.html so Cloudflare Pages serves
  // /route and /route/ both cleanly with 200.
  trailingSlash: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
};

export default nextConfig;
