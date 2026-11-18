import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/svg-to-png';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/svg-to-png/',
    languages: { en: '/svg-to-png/', 'pt-BR': '/pt/svg-para-png/', 'x-default': '/svg-to-png/' },
  },
  openGraph: openGraphFor({ title, description, url: '/svg-to-png/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .SVG. Nothing was uploaded, so nothing was stored.`;

export default function SvgToPngPage() {
  return (
    <ToolPage
      route="/svg-to-png/"
      name="SVG to PNG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="svg-png"
      accept={['.svg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
