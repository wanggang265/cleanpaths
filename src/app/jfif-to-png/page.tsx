import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/jfif-to-png';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/jfif-to-png/',
    languages: { en: '/jfif-to-png/', 'pt-BR': '/pt/jfif-para-png/', 'x-default': '/jfif-to-png/' },
  },
  openGraph: openGraphFor({ title, description, url: '/jfif-to-png/' }),
};

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .JFIF. Nothing was uploaded, so nothing was stored.`;

export default function JfifToPngPage() {
  return (
    <ToolPage
      route="/jfif-to-png/"
      name="JFIF to PNG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="jfif-png"
      accept={['.jfif']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
