// Vendor build: produces fully self-contained ESM bundles (worker + WASM
// inlined as data URLs) so the output can be dropped into a static asset
// folder and loaded via a plain dynamic import() with no bundler/asset-path
// resolution. Used to vendor @silurus/ooxml into the Mosaik H5 front-end.
//
// Prerequisites: run `pnpm install` and `pnpm build:wasm` first. If the WASM
// build fails on the binaryen/`wasm-opt` download step (e.g. in a sandbox with
// no GitHub access), set `wasm-opt = false` under
// `[package.metadata.wasm-pack.profile.release]` in each `packages/*/parser/
// Cargo.toml` — the bundles are functionally identical, only larger.
//
// Output: dist-vendor/{pptx,docx,xlsx}.mjs plus shared chunks
// {bridge,renderer,mathjax}.js. Build with:
//   npx vite build --config vite.vendor.config.ts
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [wasm()],
  build: {
    outDir: 'dist-vendor',
    emptyOutDir: true,
    // Inline every asset (including the .wasm parsers) as base64 data URLs so
    // each entry .mjs is a single self-contained file.
    assetsInlineLimit: () => true,
    lib: {
      entry: {
        pptx: resolve(__dirname, 'src/pptx.ts'),
        xlsx: resolve(__dirname, 'src/xlsx.ts'),
        docx: resolve(__dirname, 'src/docx.ts'),
      },
      formats: ['es'],
      fileName: (_format, name) => `${name}.mjs`,
    },
    rollupOptions: {
      output: { chunkFileNames: '[name].js', inlineDynamicImports: false },
    },
    target: 'esnext',
  },
  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },
});
