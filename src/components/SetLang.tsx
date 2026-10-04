'use client';

import { useEffect } from 'react';

/** Sets <html lang> on the client for the PT route (root layout is shared). */
export default function SetLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
