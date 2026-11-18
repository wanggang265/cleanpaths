import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-svg-para-png';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/svg-para-png/',
    languages: { en: '/svg-to-png/', 'pt-BR': '/pt/svg-para-png/', 'x-default': '/svg-to-png/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/svg-para-png/', locale: 'pt_BR' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). hreflang/languages 已接线（2a 批 L7）。
const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .SVG. Nada foi enviado, então nada foi armazenado.`;

export default function PtSvgParaPngPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
      route="/pt/svg-para-png/"
        lang="pt"
      name="Conversor de SVG para PNG — Grátis, sem Upload"
      description={description}
      mainHtml={mainHtml}
      kind="svg-png"
      accept={['.svg']}
      errorMessage={ERROR_MESSAGE}
    />
    </>
  );
}
