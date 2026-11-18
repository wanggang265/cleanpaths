import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/bmp-to-jpg';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/bmp-to-jpg/',
    languages: { en: '/bmp-to-jpg/', 'pt-BR': '/pt/bmp-para-jpg/', 'x-default': '/bmp-to-jpg/' },
  },
  openGraph: openGraphFor({ title, description, url: '/bmp-to-jpg/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .BMP. Nothing was uploaded, so nothing was stored.`;

export default function BmpToJpgPage() {
  return (
    <ToolPage
      route="/bmp-to-jpg/"
      name="BMP to JPG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="bmp-jpg"
      accept={['.bmp']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
