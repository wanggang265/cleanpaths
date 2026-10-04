import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/png-to-dxf';
import ToolPage from '@/components/ToolPage';

export const metadata: Metadata = { title, description, alternates: { canonical: '/png-to-dxf/' } };

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .PNG. Nothing was uploaded, so nothing was stored.`;

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
    />
  );
}
