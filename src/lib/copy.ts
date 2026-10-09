/**
 * Frozen copy — 06c additions, verbatim from design-source/build/components.py
 * (FB_COPY / SHARE_COPY / SHOWCASE_COPY) and states_common.py.
 * 05 §12 frozen. DO NOT EDIT — changes must go through zhongshu/05c + audit.py.
 */

export const FB_COPY = {
  en: {
    fab: 'Feedback',
    fab_aria: 'Open feedback',
    title: 'Feedback',
    sub: 'Bugs, ideas, praise, anything — it lands on my workbench, not in a ticket queue.',
    types: ['Idea', 'Bug', 'Praise', 'Other'],
    placeholder: "What worked, what didn't…",
    contact: "Email or handle (optional — only if you'd like a reply)",
    trust:
      "No contact info needed — please don't include personal info you don't want to share. We auto-attach this page and your language, never your files. <b>We never see your files.</b>",
    submit: 'Send feedback',
    success: 'Thanks — this goes straight to the person building CleanPaths.',
    close_aria: 'Close feedback dialog',
    error: "That didn't send — try again, or email feedback@cleanpaths.io directly.",
    retry: 'Try again',
    // 05 v1.4 §B (frozen): FAB modal empty-submit inline hint (FAB modal only,
    // not FeedbackInline — emoji rating alone is valid feedback there).
    msg_required: 'Add a quick message first — even one word helps.',
  },
  pt: {
    fab: 'Feedback',
    fab_aria: 'Abrir feedback',
    title: 'Feedback',
    sub: 'Bugs, ideias, elogios — cai direto na minha bancada, não numa fila de tickets.',
    types: ['Ideia', 'Bug', 'Elogio', 'Outro'],
    placeholder: 'O que funcionou, o que não funcionou…',
    contact: 'E-mail ou usuário (opcional — só se quiser resposta)',
    trust:
      'Não é preciso deixar contato — não inclua dados pessoais que você não quer compartilhar. Anexamos esta página e seu idioma automaticamente, nunca seus arquivos. <b>Nós nunca vemos seus arquivos.</b>',
    submit: 'Enviar feedback',
    success: 'Obrigado — vai direto para a pessoa que está construindo o CleanPaths.',
    close_aria: 'Fechar feedback',
    error: 'Não foi possível enviar — tente de novo, ou escreva para feedback@cleanpaths.io.',
    retry: 'Tentar de novo',
    msg_required: 'Escreva uma mensagem primeiro — mesmo uma palavra já ajuda.',
  },
} as const;

export const SHARE_COPY = {
  en: {
    title: 'Share your result',
    copy: 'Copy link',
    copied: 'Link copied',
    x: 'Post to X',
    dl_img: 'Download share image',
    x_prefill: 'Just turned a messy image into clean vector layers — in my browser, no upload. cleanpaths.io',
    optin: 'Feature my result on the examples wall',
    optin_micro:
      'Off by default. If you check it, we confirm by email before anything goes up — leave a contact in the feedback form.',
  },
  pt: {
    title: 'Compartilhe seu resultado',
    copy: 'Copiar link',
    copied: 'Link copiado',
    x: 'Postar no X',
    dl_img: 'Baixar imagem para compartilhar',
    x_prefill: 'Converti minha imagem em camadas vetoriais limpas — direto no navegador, sem upload. cleanpaths.io',
    optin: 'Mostrar meu resultado no mural de exemplos',
    optin_micro:
      'Desativado por padrão. Se marcar, confirmamos por e-mail antes de publicar — deixe um contato no formulário de feedback.',
  },
} as const;

export const SHOWCASE_COPY = {
  featured_label: 'Featured examples',
  featured_more: 'See all before / after →',
  community_title: 'Community',
  community_note:
    'Real maker results land here — featured only with explicit opt-in. Nothing yet: the wall opens when the first makers say yes.',
  community_spec: 'Reserved — opens on first opt-ins',
} as const;

/** Inline feedback form (Amend A001) — frozen 05 §0.7 / §11.4, verbatim from components.py */
export const INLINE_FEEDBACK = {
  heading: 'How did this one turn out?',
  ratings: [
    { emoji: '😄', label: 'Cut-ready — it worked' },
    { emoji: '😐', label: 'Close, but not quite' },
    { emoji: '😞', label: 'Not usable' },
  ],
  textareaPlaceholder:
    "What went wrong (or right)? Optional — please don't include personal info you don't want to share. Leave your email only if you'd like a reply.",
  submit: { en: 'Send feedback', pt: 'Enviar feedback' },
  success: {
    en: 'Thanks — this goes straight to the person building CleanPaths.',
    pt: 'Obrigado — vai direto para a pessoa que está construindo o CleanPaths.',
  },
} as const;

/** Daily-cap state — frozen 05 §11.2 (EN paywalled variant / PT neutral variant) */
export const CAP_COPY = {
  en: {
    badge: '10/10',
    aria: '10 of 10 free conversions used today',
    main: "That's your 10 for today — the free counter resets tomorrow.",
    conv: 'On a deadline? Pro removes the daily cap — $59, one time. No subscriptions. 30-day money-back guarantee.',
    mono: 'FREE COUNTER RESETS DAILY · PRO: NO DAILY CAP',
    cta_pro: 'Get CleanPaths Pro — $59, one time',
    cta_pricing: 'See pricing →',
  },
  pt: {
    badge: '10/10',
    aria: '10 of 10 free conversions used today',
    main: 'Você usou as 10 conversões grátis de hoje — o contador reinicia amanhã.',
    cta: 'Ver opções →',
    mono: 'CONTADOR GRATUITO REINICIA TODO DIA',
  },
} as const;

/** Tool state UI — frozen 05 §11.3, verbatim from states_common.py */
export const STATE_COPY = {
  en: {
    dz_drop: 'Drop your file here',
    dz_or: 'RELEASE TO START',
    proc_main: 'Converting — on your device, nothing uploaded',
    err_main_pre: "That file can't be converted here.",
    err_main_post: 'Nothing was uploaded, so nothing was stored.',
    err_btn: 'Choose another file',
    // 05 v1.4 §A (frozen 2026-10-09): processing-failure variant — file passed
    // the format gate but the pipeline threw. Never co-render with err_main_pre.
    err_fail_pre: "Your file is the right type, but we couldn't convert it.",
    err_fail_hint:
      'Try a simpler file — or, for an SVG, re-save it as a plain SVG in an editor first and drop it back in.',
    input_cap: 'INPUT',
    output_cap: 'OUTPUT PREVIEW',
    closed: 'closed',
    more_layers: 'more layers, all closed paths',
    precision: 'Precision',
    pro_active: '✓ PRO ACTIVE',
    pro_no_cap: 'no daily cap',
    pro_offline: 'works offline after activation',
    ai_hd: 'AI HD rescue',
    ai_hd_desc:
      "An optional AI upscaler that runs on your device's GPU (no upload) for heavily degraded images. Free tier includes 3 tries; Pro includes it with no per-use limit.",
  },
  pt: {
    dz_drop: 'Arraste seu arquivo .jfif aqui — ou clique para escolher',
    dz_or: 'SOLTE PARA COMEÇAR',
    proc_main: 'Convertendo — no seu navegador, nada foi enviado',
    err_main_pre: 'Este arquivo não pode ser convertido aqui.',
    err_main_post: 'Nada foi enviado, então nada foi armazenado.',
    err_btn: 'Escolher outro arquivo',
    // 05 v1.4 §A (frozen 2026-10-09): processing-failure variant
    err_fail_pre: 'Seu arquivo é do tipo certo, mas não conseguimos convertê-lo.',
    err_fail_hint:
      'Tente um arquivo mais simples — ou, se for um SVG, salve-o novamente como SVG simples em um editor e arraste de volta.',
    input_cap: 'INPUT',
    output_cap: 'OUTPUT PREVIEW',
    closed: 'closed',
    more_layers: 'more layers, all closed paths',
    precision: 'Precision',
    pro_active: '✓ PRO ACTIVE',
    pro_no_cap: 'no daily cap',
    pro_offline: 'works offline after activation',
  },
} as const;

export const STEPS = {
  trace: ['✓ Reading file (local)', '▸ Tracing paths — auto-tuned parameters', '○ Preparing download'],
  svg: ['✓ Reading file (local)', '▸ Converting curves to polylines', '○ Preparing download'],
  jfif: ['✓ Reading file (local)', '▸ Repackaging as JPG', '○ Preparing download'],
  jfif_pt: ['✓ Lendo o arquivo (local)', '▸ Reempacotando como JPG', '○ Preparando o download'],
} as const;

/** Download button labels — frozen (states_common.py *_DL_BTNS) */
export const DL_COPY = {
  dxf_r2000: 'Download DXF (R2000)',
  dxf_r12: 'Download DXF (R12)',
  svg: 'Download SVG',
  jpg: 'Download JPG',
  jpg_pt: 'Baixar JPG',
} as const;
