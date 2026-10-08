import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/jfif-to-jpg';
import ToolPage from '@/components/ToolPage';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/jfif-to-jpg/',
    languages: { en: '/jfif-to-jpg/', 'pt-BR': '/pt/jfif-para-jpg/', 'x-default': '/jfif-to-jpg/' },
  },
  openGraph: openGraphFor({ title, description, url: '/jfif-to-jpg/' }),
};

const ERROR_MESSAGE = `<b>That file can't be converted here.</b> This page accepts .JFIF. Nothing was uploaded, so nothing was stored.`;

export default function JfifToJpgPage() {
  return (
    <ToolPage
      route="/jfif-to-jpg/"
      name="JFIF to JPG Converter — Free, No Upload"
      description={description}
      mainHtml={mainHtml}
      kind="jfif"
      accept={['.jfif']}
      errorMessage={ERROR_MESSAGE}
    />
  );
}
