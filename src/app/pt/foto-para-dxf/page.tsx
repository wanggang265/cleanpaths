import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-foto-para-dxf';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/foto-para-dxf/',
    languages: { en: '/photo-to-dxf/', 'pt-BR': '/pt/foto-para-dxf/', 'x-default': '/photo-to-dxf/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/foto-para-dxf/', locale: 'pt_BR' }),
};

// [PENDING-07-formats] backfill (05 v1.13 §B-1 PT: same as EN — 07 fills
// from the real component accept list below).
const html = mainHtml.replace('{FORMATS}</span>', '.JPG, .JPEG, .PNG</span>');

const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .JPG, .JPEG, .PNG. Nada foi enviado, então nada foi armazenado.`;

export default function PtFotoParaDxfPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/foto-para-dxf/"
        lang="pt"
        name="Conversor de Foto para DXF — Grátis, sem Upload"
        description={description}
        mainHtml={html}
        kind="trace-raster"
        accept={['.jpg', '.jpeg', '.png']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
