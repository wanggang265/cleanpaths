import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/svg-to-jpg';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/svg-to-jpg/' },
  openGraph: openGraphFor({ title, description, url: '/svg-to-jpg/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). 无 hreflang/languages 交替（PROMPT 硬性要求 3）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .SVG. Nothing was uploaded, so nothing was stored.`;

export default function SvgToJpgPage() {
  return (
    <ToolPage
      route="/svg-to-jpg/"
      name="SVG to JPG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="svg-jpg"
      accept={['.svg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
