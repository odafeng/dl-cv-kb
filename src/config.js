// ============================================================
// config.js — Runtime configuration
// ============================================================
// Single source of truth for environment-dependent settings.
// Lives in src/ root (not src/data/) because it's consumed by
// behavior modules (pdf-modal), not data modules.

// ----- PDF storage backend -----
// PDFs live in Supabase Storage (bucket `papers`, public-read RLS).
// To roll back to local serving, set USE_SUPABASE = false and restore
// the ./pdfs/ directory from git history.
export const USE_SUPABASE = true;

// Public Supabase project + anon key (safe to commit; bucket is public-read,
// public is restricted via RLS to the `papers` bucket only).
export const SUPABASE = {
  url:    "https://fxzmwzwoqgpwnoxfhwcy.supabase.co",
  bucket: "papers",
  // Anon key — only needed if we ever switch the bucket to private/signed.
  // Public reads on a public bucket need no auth header.
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4em13endvcWdwd25veGZod2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTg3NzMsImV4cCI6MjA5Mjg3NDc3M30.BoVwPk1_EL2q0-bp5FLRWfzlzEBukG6tAvYH9CmkagI",
};

// ----- Resolve a paper to its PDF URL -----
// Surgical-domain papers live in Supabase Storage (we curated those).
// General DL-in-CV reference papers fall back to arXiv (iframe-friendly).
// Anything else falls back to DOI resolver as last resort.
//
// Backward-compat: if called with a string id (not paper object) we
// assume Supabase + that id, matching pre-3b behavior.
export function pdfUrlFor(idOrPaper) {
  // Legacy string-id path
  if (typeof idOrPaper === 'string') {
    return `${SUPABASE.url}/storage/v1/object/public/${SUPABASE.bucket}/${idOrPaper}.pdf`;
  }

  const p = idOrPaper;
  // Local Supabase: explicit `local: true` OR surgical-domain default
  const useLocal = p.local === true || (p.local !== false && p.domain === 'surgical');

  if (USE_SUPABASE && useLocal) {
    return `${SUPABASE.url}/storage/v1/object/public/${SUPABASE.bucket}/${p.id}.pdf`;
  }
  if (p.ax)  return `https://arxiv.org/pdf/${p.ax}.pdf`;
  if (p.doi) return `https://doi.org/${p.doi}`;
  return null;  // Caller (pdf-modal) shows "no PDF available" message
}
