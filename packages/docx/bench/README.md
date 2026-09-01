# Cross-renderer parity fixtures

Minimal harness pages used to capture this renderer's output for comparison
against headless LibreOffice, alongside a second engine. They are separate from
`tests/visual/` on purpose: VRT compares this renderer against *itself* over
time, and these compare it against a *different implementation*, which needs a
different contract.

What each fixture guarantees, and why:

- **It renders at the reference's own resolution.** DOCX asks the engine for the
  page's point size and sizes the canvas to `pt / 72 * dpi`; PPTX does the same
  from `slideWidth`/`slideHeight`, which are EMU (914400 per inch). Rendering at
  an arbitrary width and resampling afterwards puts a resampler between the two
  rasterisers and makes every metric noisier than the difference being measured.
- **It reports the engine's real page count** on `document.body.dataset.pageCount`,
  so the driver can tell a genuine page from a clamped repeat of page 1.
- **It waits for layout and for fonts** before the first paint. A silent font
  substitution invalidates every number downstream of it.
- **It fetches by a sanitised id**, not by corpus path: Vite's static server does
  not decode `%2C` or `%23`, so a filename carrying a comma or a hash 404s under
  its literal path. The driver stages the corpus as `public/bench-corpus/<id>`.

XLSX has no print pagination — `renderViewport(sheet, {row, col, rows, cols})` is
the only entry point — so its fixture draws an A1-anchored viewport at the
comparison DPI and reports the row/column header strip's size so the driver can
crop it. That output is a screen grid, not a printed page; it is not comparable
to a paginated reference and should not be scored as if it were.

Both `public/corpus` and `public/bench-corpus` are generated symlink trees into a
local sample-files checkout and are git-ignored.
