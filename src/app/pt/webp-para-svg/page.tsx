import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-webp-para-svg';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/webp-para-svg/',
    languages: { en: '/webp-to-svg/', 'pt-BR': '/pt/webp-para-svg/', 'x-default': '/webp-to-svg/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/webp-para-svg/', locale: 'pt_BR' }),
};

const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .WEBP. Nada foi enviado, então nada foi armazenado.`;

export default function PtWebpParaSvgPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/webp-para-svg/"
        lang="pt"
        name="Conversor de WebP para SVG — Grátis, sem Upload"
        description={description}
        mainHtml={mainHtml}
        kind="webp-svg"
        accept={['.webp']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
