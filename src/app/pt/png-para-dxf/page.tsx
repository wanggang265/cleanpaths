import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-png-para-dxf';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/png-para-dxf/',
    languages: { en: '/png-to-dxf/', 'pt-BR': '/pt/png-para-dxf/', 'x-default': '/png-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/png-para-dxf/', locale: 'pt_BR' }),
};

// 2b batch3 (05-copy-freeze-v1.18): frozen verbatim from this page's states.html STATE 5.
const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .PNG. Nada foi enviado, então nada foi armazenado.`;

export default function PtPngParaDxfPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/png-para-dxf/"
        lang="pt"
        name="PNG para DXF — Conversor Grátis, sem Upload"
        description={description}
        mainHtml={mainHtml}
        kind="trace-raster"
        accept={['.png']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
