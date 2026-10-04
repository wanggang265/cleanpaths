import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/screenshot-to-svg';
import ToolPage from '@/components/ToolPage';

export const metadata: Metadata = { title, description, alternates: { canonical: '/screenshot-to-svg/' } };

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .PNG. Nothing was uploaded, so nothing was stored.`;

export default function ScreenshotToSvgPage() {
  return (
    <ToolPage
      route="/screenshot-to-svg/"
      name="Screenshot to SVG — Clean Vector from Any UI Screenshot"
      description={description}
      mainHtml={mainHtml}
      kind="screenshot"
      accept={['.png']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
