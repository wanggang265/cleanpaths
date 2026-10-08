import type { Metadata } from 'next';
import { description, mainHtml, title } from '@/content/pages/pt-jfif-para-jpg';
import ToolPage from '@/components/ToolPage';
import SetLang from '@/components/SetLang';
import { openGraphFor } from '@/lib/schema';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/pt/jfif-para-jpg/',
    languages: { en: '/jfif-to-jpg/', 'pt-BR': '/pt/jfif-para-jpg/', 'x-default': '/jfif-to-jpg/' },
  },
  openGraph: openGraphFor({ title, description, url: '/pt/jfif-para-jpg/', locale: 'pt_BR' }),
};

const ERROR_MESSAGE = `<b>Este arquivo não pode ser convertido aqui.</b> Esta página aceita .JFIF. Nada foi enviado, então nada foi armazenado.`;

export default function PtJfifParaJpgPage() {
  return (
    <>
      <SetLang lang="pt-BR" />
      <ToolPage
        route="/pt/jfif-para-jpg/"
        lang="pt"
        name="Conversor de JFIF para JPG — Grátis, sem Upload"
        description={description}
        mainHtml={mainHtml}
        kind="jfif"
        accept={['.jfif']}
        errorMessage={ERROR_MESSAGE}
      />
    </>
  );
}
