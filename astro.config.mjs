import { defineConfig } from 'astro/config'

import preact from '@astrojs/preact'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  // Astro 7 defaults to 'jsx', which drops the whitespace between inline
  // elements that separates words here. `true` keeps compressing, but
  // losslessly — it preserves spacing that affects rendering.
  compressHTML: true,
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()]
  }
})
