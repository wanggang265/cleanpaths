'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * CookieNotice — simple analytics notice bar (2026-10-14).
 *
 * Notice-only (not opt-in/opt-out): GA4 + Clarity load regardless; this bar
 * discloses them and links to /cookies/. Dismissal is remembered in
 * localStorage. PT copy shows on /pt/* routes, EN elsewhere.
 */
export default function CookieNotice() {
  const [show, setShow] = useState(false);
  const [pt, setPt] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem('cookie-notice-dismissed')) setShow(true);
      setPt(window.location.pathname.startsWith('/pt/'));
    } catch {
      // storage blocked → show every visit; harmless
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem('cookie-notice-dismissed', '1');
    } catch {
      /* storage blocked — bar just returns next visit */
    }
    setShow(false);
  };

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 90,
        background: '#1E2430',
        color: '#F3EFE4',
        padding: '12px 16px',
        fontSize: 14,
        lineHeight: 1.5,
        boxShadow: '0 -2px 12px rgba(0,0,0,.25)',
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ flex: '1 1 420px' }}>
          {pt ? (
            <>
              Usamos cookies de análise (Google Analytics e Microsoft Clarity) para entender como o
              site é usado — sem anúncios e sem rastreamento entre sites. Seus arquivos continuam
              100% no seu dispositivo.{' '}
              <Link href="/cookies/" style={{ color: '#F3EFE4', textDecoration: 'underline' }}>
                Detalhes
              </Link>
            </>
          ) : (
            <>
              We use analytics cookies (Google Analytics &amp; Microsoft Clarity) to see how the
              site is used — no ads, no cross-site tracking. Your files still never leave your
              device.{' '}
              <Link href="/cookies/" style={{ color: '#F3EFE4', textDecoration: 'underline' }}>
                Details
              </Link>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={dismiss}
          style={{
            background: '#E4572E',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '8px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {pt ? 'Entendi' : 'Got it'}
        </button>
      </div>
    </div>
  );
}
