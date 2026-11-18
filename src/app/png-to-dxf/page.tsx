import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/png-to-dxf';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/png-to-dxf/' },
  openGraph: openGraphFor({ title, description, url: '/png-to-dxf/' }),
};

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .PNG. Nothing was uploaded, so nothing was stored.`;

// 2a L5: laser-cutting 内链已上移冻结真源（design-source bullet 锚=laser cutting machine），
// 原 Stage-1 T4 注入（mainWithLaserLink）随真源带锚落地后拆除。

export default function PngToDxfPage() {
  return (
    <ToolPage
      route="/png-to-dxf/"
      name="PNG to DXF Converter — Cut-Ready Output"
      description={description}
      mainHtml={mainHtml}
      kind="trace-raster"
      accept={['.png']}
      errorMessage={ERROR_MESSAGE}
      paramPanel
    />
  );
}
