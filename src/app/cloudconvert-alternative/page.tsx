import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/cloudconvert-alternative';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/cloudconvert-alternative/' },
  openGraph: openGraphFor({ title, description, url: '/cloudconvert-alternative/' }),
};

const ERROR_MESSAGE = `<b>That file can't be converted.</b> This tool accepts PNG, JPG and SVG. If your image is a HEIC or WEBP, export it as JPG or PNG first and drop it back in — nothing was uploaded, so nothing was stored.`;

export default function CloudConvertAlternativePage() {
  return (
    <ToolPage
      route="/cloudconvert-alternative/"
      name="A CloudConvert Alternative That Never Uploads Your File"
      description={description}
      mainHtml={mainHtml}
      kind="trace-multi"
      accept={['.png', '.jpg', '.jpeg', '.svg']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
