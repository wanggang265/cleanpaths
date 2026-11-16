import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/gif-to-jpg';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/gif-to-jpg/' },
  openGraph: openGraphFor({ title, description, url: '/gif-to-jpg/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). 无 hreflang/languages 交替（PROMPT 硬性要求 3）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .GIF. Nothing was uploaded, so nothing was stored.`;

export default function GifToJpgPage() {
  return (
    <ToolPage
      route="/gif-to-jpg/"
      name="GIF to JPG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="gif-jpg"
      accept={['.gif']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
