import { prepareDescriptionHtmlForDisplay } from '@/utils/descriptionHtml';

const RTL_DESCRIPTION_BASE_URL = 'https://e-tawjihi.ma/';

/** Document HTML complet pour WebView — RTL forcé sur toutes les balises. */
export function buildRtlDescriptionWebHtml(description: string | null | undefined): string {
  const inner = prepareDescriptionHtmlForDisplay(description, { rtl: true });
  if (!inner) return '';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&display=swap" rel="stylesheet" />
  <style>
    html, body {
      direction: rtl !important;
      text-align: right !important;
      unicode-bidi: embed;
      margin: 0;
      padding: 0;
      width: 100%;
      background: transparent;
      font-family: 'Cairo', 'Geeza Pro', 'Noto Naskh Arabic', sans-serif;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.55;
      color: #64748b;
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }
    body * {
      direction: rtl !important;
      text-align: right !important;
      unicode-bidi: embed;
      font-family: inherit;
    }
    p, div, span, li, h1, h2, h3, h4, h5, h6, blockquote, td, th {
      margin-top: 0;
      margin-bottom: 12px;
    }
    ul, ol {
      padding-right: 1.25em !important;
      padding-left: 0 !important;
      margin-right: 0 !important;
      margin-left: 0 !important;
      list-style-position: inside;
    }
    a {
      color: #333e8f;
      text-decoration: underline;
      font-weight: 700;
    }
    strong, b {
      color: #0f172a;
      font-weight: 800;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
  </style>
</head>
<body dir="rtl">${inner}</body>
</html>`;
}

export const RTL_DESCRIPTION_WEBVIEW_BASE_URL = RTL_DESCRIPTION_BASE_URL;

export const RTL_DESCRIPTION_HEIGHT_SCRIPT = `
(function () {
  function postHeight() {
    var h = Math.max(
      document.documentElement.scrollHeight || 0,
      document.body.scrollHeight || 0,
      document.documentElement.offsetHeight || 0,
      document.body.offsetHeight || 0
    );
    if (window.ReactNativeWebView && h > 0) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: h }));
    }
  }
  postHeight();
  setTimeout(postHeight, 80);
  setTimeout(postHeight, 300);
  setTimeout(postHeight, 800);
  if (typeof ResizeObserver !== 'undefined' && document.body) {
    try { new ResizeObserver(postHeight).observe(document.body); } catch (e) {}
  }
})();
true;
`;
