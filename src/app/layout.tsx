import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { DEFAULT_IMAGE, SITE_NAME, SITE_URL } from '@/lib/schema';
import CookieNotice from '@/components/CookieNotice';

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
        {/* Cloudflare Web Analytics */}
        <Script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon='{"token": "4c614779f2ae415bb7b4cfe8c7e53e80"}'
        />
        {/* End Cloudflare Web Analytics */}
        {/* Google Analytics (GA4) — disclosed in Cookie/Privacy Policy */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9T8XY5EB0Y"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9T8XY5EB0Y');`}
        </Script>
        {/* End Google Analytics */}
        {/* Microsoft Clarity — disclosed in Cookie/Privacy Policy */}
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "yxjgquop2c");`}
        </Script>
        {/* End Microsoft Clarity */}
        {/* Self-hosted fonts only — no Google Fonts CDN (zero-exfil narrative, 06 §8) */}
        <link rel="stylesheet" href="/assets/fonts/fonts.css" />
        <link rel="stylesheet" href="/assets/design-system.css" />
      </head>
      <body>
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
