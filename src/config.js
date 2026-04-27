// ============================================================
// config.js — Runtime configuration
// ============================================================
// Single source of truth for environment-dependent settings.
// Lives in src/ root (not src/data/) because it's consumed by
// behavior modules (pdf-modal), not data modules.

// ----- PDF storage backend -----
// Set USE_SUPABASE = true once papers/* is uploaded to Supabase.
// While false, PDFs are served from ./pdfs/ in the repo.
// This dual-mode lets us migrate without breaking the live site.
export const USE_SUPABASE = false;

// Public Supabase project + anon key (safe to commit; bucket is public-read,
// public is restricted via RLS to the `papers` bucket only).
export const SUPABASE = {
  url:    "https://fxzmwzwoqgpwnoxfhwcy.supabase.co",
  bucket: "papers",
  // Anon key — only needed if we ever switch the bucket to private/signed.
  // Public reads on a public bucket need no auth header.
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4em13endvcWdwd25veGZod2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyOTg3NzMsImV4cCI6MjA5Mjg3NDc3M30.BoVwPk1_EL2q0-bp5FLRWfzlzEBukG6tAvYH9CmkagI",
};

// ----- Resolve a paper id to its PDF URL -----
// Switching backends is a one-line edit (USE_SUPABASE).
// Future: per-paper override via paper.pdfUrl if a few PDFs need to live
// elsewhere (paywalled / private), but YAGNI until it actually happens.
export function pdfUrlFor(id) {
  if (USE_SUPABASE) {
    return `${SUPABASE.url}/storage/v1/object/public/${SUPABASE.bucket}/${id}.pdf`;
  }
  return `./pdfs/${id}.pdf`;
}
