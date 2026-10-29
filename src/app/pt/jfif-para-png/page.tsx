import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-jfif-para-png';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/jfif-para-png/',
    languages: { en: '/jfif-to-png/', 'pt-BR': '/pt/jfif-para-png/', 'x-default': '/jfif-to-png/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/jfif-para-png/', locale: 'pt_BR' }),
};

const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .JFIF. Nada foi enviado, então nada foi armazenado.`;

export default function PtJfifParaPngPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/jfif-para-png/"
        lang="pt"
        name="Conversor de JFIF para PNG — Grátis, sem Upload"
        description={description}
        mainHtml={mainHtml}
        kind="jfif-png"
        accept={['.jfif']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
