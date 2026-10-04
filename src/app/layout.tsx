import type { Metadata, Viewport } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/schema';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — Cut-Ready DXF/SVG, in Your Browser`, template: `%s` },
  icons: { icon: [{ url: '/assets/logo.svg', type: 'image/svg+xml' }] },
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
