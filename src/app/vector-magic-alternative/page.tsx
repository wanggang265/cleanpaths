import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/vector-magic-alternative';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/vector-magic-alternative/' },
  openGraph: openGraphFor({ title, description, url: '/vector-magic-alternative/' }),
};

const ERROR_MESSAGE = `<b>That file can't be converted.</b> This tool accepts PNG, JPG and SVG. If your image is a HEIC or WEBP, export it as JPG or PNG first and drop it back in — nothing was uploaded, so nothing was stored.`;

export default function VectorMagicAlternativePage() {
  return (
    <ToolPage
      route="/vector-magic-alternative/"
      name="A Vector Magic Alternative That Runs in Your Browser — and Exports Cut-Ready DXF"
      description={description}
      mainHtml={mainHtml}
      kind="trace-multi"
      accept={['.png', '.jpg', '.jpeg', '.svg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
