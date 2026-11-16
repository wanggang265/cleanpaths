import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-webp-para-png';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/pt/webp-para-png/' },
  openGraph: openGraphFor({ title, description, url: '/pt/webp-para-png/', locale: 'pt_BR' }),
};

// 07 batch2: frozen verbatim from this page's states.html STATE 5 (05 v1.15 §B2 —
// 扩展名大写). 无 hreflang/languages 交替（PROMPT 硬性要求 3）。
const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .WEBP. Nada foi enviado, então nada foi armazenado.`;

export default function PtWebpParaPngPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
      route="/pt/webp-para-png/"
        lang="pt"
      name="Conversor de WebP para PNG — Grátis, sem Upload"
      description={description}
      mainHtml={mainHtml}
      kind="webp-png"
      accept={['.webp']}
      errorMessage={ERROR_MESSAGE}
    />
    </>
  );
}
