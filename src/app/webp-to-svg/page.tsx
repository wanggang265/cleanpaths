import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/webp-to-svg';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/webp-to-svg/',
    languages: { en: '/webp-to-svg/', 'pt-BR': '/pt/webp-para-svg/', 'x-default': '/webp-to-svg/' },
  },
  openGraph: openGraphFor({ title, description, url: '/webp-to-svg/' }),
};

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .WEBP. Nothing was uploaded, so nothing was stored.`;

export default function WebpToSvgPage() {
  return (
    <ToolPage
      route="/webp-to-svg/"
      name="WebP to SVG Converter — Cut-Ready Output"
      description={description}
      mainHtml={mainHtml}
      kind="webp-svg"
      accept={['.webp']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
