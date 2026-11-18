import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/jpeg-to-dxf';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/jpeg-to-dxf/',
    languages: { en: '/jpeg-to-dxf/', 'pt-BR': '/pt/jpeg-para-dxf/', 'x-default': '/jpeg-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/jpeg-to-dxf/' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .JPEG. Nothing was uploaded, so nothing was stored.`;

export default function JpegToDxfPage() {
  return (
    <ToolPage
      route="/jpeg-to-dxf/"
      name="JPEG to DXF Converter — Cut-Ready Output"
      description={description}
      mainHtml={mainHtml}
      kind="trace-raster"
      accept={['.jpeg', '.jpg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
