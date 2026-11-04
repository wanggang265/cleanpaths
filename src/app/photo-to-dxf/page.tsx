import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/photo-to-dxf';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/photo-to-dxf/',
    languages: { en: '/photo-to-dxf/', 'pt-BR': '/pt/foto-para-dxf/', 'x-default': '/photo-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/photo-to-dxf/' }),
};

// [PENDING-07-formats] backfill (05 v1.13 §B-1: list NOT locked by copy —
// 07 fills from the real component accept list below).
const html = mainHtml.replace('{FORMATS}</span>', '.JPG, .JPEG, .PNG</span>');

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .JPG, .JPEG, .PNG. Nothing was uploaded, so nothing was stored.`;

export default function PhotoToDxfPage() {
  return (
    <ToolPage
      route="/photo-to-dxf/"
      name="Photo to DXF Converter — Honest, Stylized Results"
      description={description}
      mainHtml={html}
      kind="trace-raster"
      accept={['.jpg', '.jpeg', '.png']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
