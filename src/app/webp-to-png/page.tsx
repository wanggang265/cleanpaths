import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/webp-to-png';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/webp-to-png/',
    languages: { en: '/webp-to-png/', 'pt-BR': '/pt/webp-para-png/', 'x-default': '/webp-to-png/' },
  },
  openGraph: openGraphFor({ title, description, url: '/webp-to-png/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .WEBP. Nothing was uploaded, so nothing was stored.`;

export default function WebpToPngPage() {
  return (
    <ToolPage
      route="/webp-to-png/"
      name="WebP to PNG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="webp-png"
      accept={['.webp']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
