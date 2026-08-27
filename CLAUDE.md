# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page marketing site for **AsoAfro**, a cleaning and gardening company in Azuay, Ecuador. Static Astro site, no backend, no database, no tests. All UI copy is Spanish (Ecuador); code, identifiers and comments are English.

## Commands

```bash
pnpm dev        # astro dev — http://localhost:4321
pnpm build      # astro build — static output to dist/
pnpm preview    # wrangler pages dev ./dist — serves the build the way Cloudflare Pages will
```

There is no lint or test script. `pnpm astro ...` exposes the Astro CLI (`astro check`, `astro add`).

## Stack

Astro 4 + Tailwind 3 (`@astrojs/tailwind`) + Preact islands (`@astrojs/preact`). Images through `astro:assets` + `sharp`. Carousel is `embla-carousel`. Font is `@fontsource/oxygen`. Deploy target is Cloudflare Pages (`wrangler` is the only devDependency).

## Architecture

**One page.** `src/pages/index.astro` stacks section components inside `src/layouts/Layout.astro`:
`HeroSection` → `Features` → `Carousel` → `Form`, with `AppHeader` / `AppFooter` from the layout. Navigation is in-page anchors (`#servicios`, `#galeria`, `#formulario`, `#home`). `Container.astro` is the shared `max-w-7xl` horizontal wrapper — reuse it, don't re-declare the widths.

**Theme (dark/light) has two cooperating pieces:**
1. An inline `is:inline` script in `Layout.astro` runs before paint: reads `localStorage.theme` (falling back to `prefers-color-scheme`), toggles `.dark` on `<html>`, writes `localStorage.theme`. This exists to prevent a flash — do not move it into a component or make it a module.
2. `src/components/theme/ThemeToggle.jsx` is a Preact island mounted with `client:only="preact"` (rendered twice in `AppHeader` — desktop and mobile). It flips and persists the same `localStorage.theme` key.

Tailwind is `darkMode: 'class'`, so everything keys off that `.dark` class.

**Colors.** `tailwind.config.mjs` defines two custom scales: `primary` (teal) and `secondary` (brown/tan). The design deliberately swaps their roles between modes — light mode leans `secondary`, dark mode leans `primary`. When adding markup, follow the existing `text-primary-700 dark:text-secondary-300` style pairing rather than inventing new color combinations.

**Images.** Every gallery/feature image is its own wrapper component under `src/components/images/`, named ordinally (`FirstImage.astro` … `FourteenthImage.astro`). Each wraps `astro:assets` `<Image>` with a fixed `widths` / `sizes` responsive recipe. Allocation is not contiguous: `Carousel.astro` uses First–Sixth + Eleventh–Fourteenth; `Features.astro` uses Seventh–Tenth (imported there as `Seven`…`Ten`). To add a gallery image, create the next ordinal component and add a `.embla__slide` block in `Carousel.astro`. (Note: `FourthImage.astro` is imported as `ForthImage` in `Carousel.astro` — pre-existing typo, keep consistent if you touch it.)

**Carousel.** `src/components/Carousel.astro` owns the markup and loads behavior via `<script src='../carousel.js'>`. `src/carousel.js` is a plain DOM script (not a component) that `querySelector`s `.embla` and its children, wires the prev/next buttons, the `x / y` snap counter, and Embla plugins `AutoHeight` + `Autoplay` (loop on, 3s delay). It assumes exactly one `.embla` on the page.

**Header mobile nav.** `AppHeader.astro` uses a vanilla `<script>` that toggles `!`-prefixed important utility classes on `#navlinks` / `#hamburger` / `#navLayer`. State is a module-level `isToggled` boolean.

**Contact form.** `Form.astro` posts directly to a Formspree endpoint (`action="https://formspree.io/f/..."`, plain `method="POST"`). No JS, no server route. Field `name` attributes are Spanish because they become the email labels.

## Conventions

- 2-space indent, single quotes, no semicolons (Astro/Prettier default here).
- Spanish UI copy, `lang='es'`. Ecuadorian phone/WhatsApp links live in `AppFooter.astro`.
- `astro:assets` for every raster image — never a bare `<img src>` to `src/images/`.
