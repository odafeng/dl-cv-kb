// ============================================================
// pdf-modal.js — full-screen iframe overlay for PDF viewing
// ============================================================
// Replaces target="_blank" links because PWA standalone mode and
// some mobile browsers fall back to download instead of opening.
// An iframe forces the browser's built-in PDF viewer to render
// inline, regardless of platform.

import { P } from './data.js';
import { pdfUrlFor } from './config.js';

const $ = id => document.getElementById(id);

export function openPDF(id) {
  const p = P.find(pp => pp.id === id);
  if (!p) {
    console.warn('openPDF: unknown paper id', id);
    return;
  }
  const url = pdfUrlFor(p);
  const title = p.t || id;

  $('pdf-modal-title').textContent = title;

  if (!url) {
    // No PDF source resolvable — at least show the metadata
    $('pdf-modal-newtab').href = '#';
    $('pdf-modal-frame').srcdoc = `
      <div style="font-family:sans-serif;padding:40px;color:#888;text-align:center">
        <p>此論文無可用的 PDF 連結。</p>
        ${p.gh ? `<p><a href="https://github.com/${p.gh}" target="_blank">GitHub: ${p.gh}</a></p>` : ''}
      </div>`;
  } else {
    $('pdf-modal-newtab').href = url;
    // Set src last so the iframe starts loading after labels are in place
    $('pdf-modal-frame').removeAttribute('srcdoc');
    $('pdf-modal-frame').src = url;
  }
  $('pdf-modal').hidden = false;
  document.body.style.overflow = 'hidden';
}

export function closePDF() {
  $('pdf-modal').hidden = true;
  // Clear iframe to free memory and stop any background loading.
  // Using 'about:blank' rather than '' to avoid re-fetching the page itself.
  $('pdf-modal-frame').src = 'about:blank';
  document.body.style.overflow = '';
}

export function initPDFModal() {
  // ESC closes
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('pdf-modal').hidden) {
      closePDF();
    }
  });

  // Click on the bar background (but not its buttons) closes too.
  // Iframes swallow clicks themselves, so clicking the PDF won't trigger this.
  $('pdf-modal').addEventListener('click', e => {
    if (e.target.id === 'pdf-modal') closePDF();
  });
}
