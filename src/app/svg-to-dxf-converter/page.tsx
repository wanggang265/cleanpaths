import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/svg-to-dxf-converter';
import ToolPage from '@/components/ToolPage';

export const metadata: Metadata = { title, description, alternates: { canonical: '/svg-to-dxf-converter/' } };

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .SVG. Nothing was uploaded, so nothing was stored.`;

export default function SvgToDxfPage() {
  return (
    <ToolPage
      route="/svg-to-dxf-converter/"
      name="SVG to DXF Converter — R12 & R2000, Units Included"
      description={description}
      mainHtml={mainHtml}
      kind="svg-dxf"
      accept={['.svg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
