import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/jpeg-to-jpg';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/jpeg-to-jpg/',
    languages: { en: '/jpeg-to-jpg/', 'pt-BR': '/pt/jpeg-para-jpg/', 'x-default': '/jpeg-to-jpg/' },
  },
  openGraph: openGraphFor({ title, description, url: '/jpeg-to-jpg/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .JPEG. Nothing was uploaded, so nothing was stored.`;

export default function JpegToJpgPage() {
  return (
    <ToolPage
      route="/jpeg-to-jpg/"
      name="JPEG to JPG Converter — Same Image, Right Extension"
      description={description}
      mainHtml={mainHtml}
      kind="jpeg-jpg"
      accept={['.jpeg', '.jpg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
