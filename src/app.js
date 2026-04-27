// ============================================================
// app.js — entry point
// ============================================================
// Wires modules together, exposes the small handful of functions
// that inline `onclick` attributes in rendered HTML still rely on,
// and registers the service worker.

import { buildNav, showP, showS, toggleSB, doSearch } from './nav.js';
import { showChapter, downloadChapterMD } from './views.js';
import { toggleCk, initRowClickDelegation } from './checkboxes.js';
import { openPDF, closePDF, initPDFModal } from './pdf-modal.js';

// Inline onclicks in dynamically-rendered HTML need globals.
// Keeping this surface small and explicit instead of letting it sprawl.
window.showP            = showP;
window.showS            = showS;
window.showChapter      = showChapter;
window.downloadChapterMD = downloadChapterMD;
window.toggleSB         = toggleSB;
window.doSearch         = doSearch;
window.toggleCk         = toggleCk;
window.openPDF          = openPDF;
window.closePDF         = closePDF;

// ----- Boot -----
buildNav();
initRowClickDelegation();
initPDFModal();
showP('overview');

// ----- PWA -----
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
