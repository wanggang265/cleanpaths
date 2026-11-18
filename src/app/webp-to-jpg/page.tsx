import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/webp-to-jpg';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/webp-to-jpg/',
    languages: { en: '/webp-to-jpg/', 'pt-BR': '/pt/webp-para-jpg/', 'x-default': '/webp-to-jpg/' },
  },
  openGraph: openGraphFor({ title, description, url: '/webp-to-jpg/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .WEBP. Nothing was uploaded, so nothing was stored.`;

export default function WebpToJpgPage() {
  return (
    <ToolPage
      route="/webp-to-jpg/"
      name="WebP to JPG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="webp-jpg"
      accept={['.webp']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
