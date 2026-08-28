import { defineConfig } from 'astro/config'

import preact from '@astrojs/preact'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  // Absolute URL of the deployed site — used for canonical and Open Graph
  // tags. Update this to the production domain when it is set.
  site: 'https://asoafro.pages.dev',
  // Astro 7 defaults to 'jsx', which drops the whitespace between inline
  // elements that separates words here. `true` keeps compressing, but
  // losslessly — it preserves spacing that affects rendering.
  compressHTML: true,
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()]
  }
})
