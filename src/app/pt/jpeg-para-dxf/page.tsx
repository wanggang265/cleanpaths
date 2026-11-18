import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-jpeg-para-dxf';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/jpeg-para-dxf/',
    languages: { en: '/jpeg-to-dxf/', 'pt-BR': '/pt/jpeg-para-dxf/', 'x-default': '/jpeg-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/jpeg-para-dxf/', locale: 'pt_BR' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .JPEG. Nada foi enviado, então nada foi armazenado.`;

export default function PtJpegParaDxfPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
      route="/pt/jpeg-para-dxf/"
        lang="pt"
      name="Conversor de JPEG para DXF — Grátis, sem Upload"
      description={description}
      mainHtml={mainHtml}
      kind="trace-raster"
      accept={['.jpeg', '.jpg']}
      errorMessage={ERROR_MESSAGE}
    />
    </>
  );
}
