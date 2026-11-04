import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/image-to-dxf';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/image-to-dxf/',
    languages: { en: '/image-to-dxf/', 'pt-BR': '/pt/imagem-para-dxf/', 'x-default': '/image-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/image-to-dxf/' }),
};

// [PENDING-07-formats] backfill (05 v1.13 §A-1: list NOT locked by copy —
// 07 fills from the real component accept list below).
const html = mainHtml.replace('{FORMATS}</span>', '.PNG, .JPG, .SVG</span>');

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .PNG, .JPG, .SVG. Nothing was uploaded, so nothing was stored.`;

export default function ImageToDxfPage() {
  return (
    <ToolPage
      route="/image-to-dxf/"
      name="Image to DXF Converter — Cut-Ready Output"
      description={description}
      mainHtml={html}
      kind="trace-multi"
      accept={['.png', '.jpg', '.jpeg', '.svg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
