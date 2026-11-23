import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-svg-para-dxf';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/svg-para-dxf/',
    languages: { en: '/svg-to-dxf-converter/', 'pt-BR': '/pt/svg-para-dxf/', 'x-default': '/svg-to-dxf-converter/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/svg-para-dxf/', locale: 'pt_BR' }),
};

// 2b batch3 (05-copy-freeze-v1.18): frozen verbatim from this page's states.html STATE 5.
const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .SVG. Nada foi enviado, então nada foi armazenado.`;

export default function PtSvgParaDxfPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/svg-para-dxf/"
        lang="pt"
        name="SVG para DXF — R12 e R2000, Unidades Incluídas"
        description={description}
        mainHtml={mainHtml}
        kind="svg-dxf"
        accept={['.svg']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
