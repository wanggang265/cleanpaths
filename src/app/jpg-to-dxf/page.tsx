import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/jpg-to-dxf';
import ToolPage from '@/components/ToolPage';

export const metadata: Metadata = { title, description, alternates: { canonical: '/jpg-to-dxf/' } };

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .JPG. Nothing was uploaded, so nothing was stored.`;

export default function JpgToDxfPage() {
  return (
    <ToolPage
      route="/jpg-to-dxf/"
      name="JPG to DXF — Turn Client Photos of Logos into Cut Files"
      description={description}
      mainHtml={mainHtml}
      kind="trace-raster"
      accept={['.jpg', '.jpeg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
