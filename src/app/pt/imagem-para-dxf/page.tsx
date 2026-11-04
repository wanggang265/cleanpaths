import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-imagem-para-dxf';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/imagem-para-dxf/',
    languages: { en: '/image-to-dxf/', 'pt-BR': '/pt/imagem-para-dxf/', 'x-default': '/image-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/imagem-para-dxf/', locale: 'pt_BR' }),
};

// [PENDING-07-formats] backfill (05 v1.13 §A-2: same as EN — 07 fills from
// the real component accept list below).
const html = mainHtml.replace('{FORMATS}</span>', '.PNG, .JPG, .SVG</span>');

const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .PNG, .JPG, .SVG. Nada foi enviado, então nada foi armazenado.`;

export default function PtImagemParaDxfPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/imagem-para-dxf/"
        lang="pt"
        name="Conversor de Imagem para DXF — Grátis, sem Upload"
        description={description}
        mainHtml={html}
        kind="trace-multi"
        accept={['.png', '.jpg', '.jpeg', '.svg']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
