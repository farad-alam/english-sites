import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    // Images are served by Sanity's own image CDN (resize + WebP/AVIF on the fly),
    // so we skip the Next.js optimizer — that keeps the Worker small and free of
    // extra Cloudflare image costs. See lib/image-loader.ts.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
}

export default nextConfig

