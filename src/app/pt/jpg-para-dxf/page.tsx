import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-jpg-para-dxf';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/jpg-para-dxf/',
    languages: { en: '/jpg-to-dxf/', 'pt-BR': '/pt/jpg-para-dxf/', 'x-default': '/jpg-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/jpg-para-dxf/', locale: 'pt_BR' }),
};

// 2b batch3 (05-copy-freeze-v1.18): frozen verbatim from this page's states.html STATE 5.
const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .JPG. Nada foi enviado, então nada foi armazenado.`;

export default function PtJpgParaDxfPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/jpg-para-dxf/"
        lang="pt"
        name="JPG para DXF — Conversor Grátis, sem Upload"
        description={description}
        mainHtml={mainHtml}
        kind="trace-raster"
        accept={['.jpg', '.jpeg']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
