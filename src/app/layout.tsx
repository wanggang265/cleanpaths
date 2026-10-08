import type { Metadata, Viewport } from 'next';
import { DEFAULT_IMAGE, SITE_NAME, SITE_URL } from '@/lib/schema';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Cut-Ready DXF/SVG, in Your Browser`, template: `%s` },
  icons: { icon: [{ url: '/assets/logo.svg', type: 'image/svg+xml' }, { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }] },
  // OG defaults — each page merges in its own title/description/url (08 P1-2).
  // og:url resolves against metadataBase → production domain https://cleanpaths.io.
  openGraph: {
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [DEFAULT_IMAGE],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF6EE',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Self-hosted fonts only — no Google Fonts CDN (zero-exfil narrative, 06 §8) */}
        <link rel="stylesheet" href="/assets/fonts/fonts.css" />
        <link rel="stylesheet" href="/assets/design-system.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
