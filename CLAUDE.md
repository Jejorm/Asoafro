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

`astro dev` daemonizes — it returns to the shell while the server keeps running, so Ctrl-C on the spawning process leaves it up. Stop it with `pnpm astro dev stop` (`pnpm astro dev status` / `logs`).

## Stack

Astro 7 + Tailwind 4 + Preact islands (`@astrojs/preact`). Images through `astro:assets` + `sharp`. Carousel is `embla-carousel`. Font is `@fontsource/oxygen`. Deploy target is Cloudflare Pages (`wrangler` is the only devDependency).

Tailwind is wired as a **Vite plugin** (`@tailwindcss/vite` in `astro.config.mjs`), not an Astro integration. `@astrojs/tailwind` is gone and cannot come back — its peer range stops at `astro ^5` / `tailwindcss ^3`.

## Architecture

**One page.** `src/pages/index.astro` stacks section components inside `src/layouts/Layout.astro`:
`HeroSection` → `Features` → `Carousel` → `Form`, with `AppHeader` / `AppFooter` from the layout. Navigation is in-page anchors (`#servicios`, `#galeria`, `#formulario`, `#home`). `Container.astro` is the shared `max-w-7xl` horizontal wrapper — reuse it, don't re-declare the widths.

**Theme (dark/light) has two cooperating pieces:**
1. An inline `is:inline` script in `Layout.astro` runs before paint: reads `localStorage.theme` (falling back to `prefers-color-scheme`), toggles `.dark` on `<html>`, writes `localStorage.theme`. This exists to prevent a flash — do not move it into a component or make it a module.
2. `src/components/theme/ThemeToggle.jsx` is a Preact island mounted with `client:only="preact"` (rendered twice in `AppHeader` — desktop and mobile). It flips and persists the same `localStorage.theme` key.

The `dark:` variant is redefined in `global.css` as `@custom-variant dark (&:where(.dark, .dark *))`, so everything keys off that `.dark` class rather than `prefers-color-scheme`.

**Colors.** `src/styles/global.css` defines two custom scales under `@theme`: `primary` (teal) and `secondary` (brown/tan). The design deliberately swaps their roles between modes — light mode leans `secondary`, dark mode leans `primary`. When adding markup, follow the existing `text-primary-700 dark:text-secondary-300` style pairing rather than inventing new color combinations.

**Images.** Every gallery/feature image is its own wrapper component under `src/components/images/`, named ordinally (`FirstImage.astro` … `FourteenthImage.astro`). Each wraps `astro:assets` `<Image>` with a fixed `widths` / `sizes` responsive recipe. Allocation is not contiguous: `Carousel.astro` uses First–Sixth + Eleventh–Fourteenth; `Features.astro` uses Seventh–Tenth (imported there as `Seven`…`Ten`). To add a gallery image, create the next ordinal component and add a `.embla__slide` block in `Carousel.astro`. (Note: `FourthImage.astro` is imported as `ForthImage` in `Carousel.astro` — pre-existing typo, keep consistent if you touch it.)

**Carousel.** `src/components/Carousel.astro` owns the markup and loads behavior via `<script src='../carousel.js'>`. `src/carousel.js` is a plain DOM script (not a component) that `querySelector`s `.embla` and its children, wires the prev/next buttons, the `x / y` snap counter, and Embla plugins `AutoHeight` + `Autoplay` (loop on, 3s delay). It assumes exactly one `.embla` on the page.

**Header mobile nav.** `AppHeader.astro` uses a vanilla `<script>` that toggles `!`-suffixed important utility classes (`visible!`, `opacity-100!`, …) on `#navlinks` / `#hamburger` / `#navLayer`. State is a module-level `isToggled` boolean. Those classes reach the bundle **only because Tailwind's scanner finds them as string literals in this file** — see the Tailwind section below before refactoring them into a variable or building them dynamically.

**Contact form.** `Form.astro` posts directly to a Formspree endpoint (`action="https://formspree.io/f/..."`, plain `method="POST"`). No JS, no server route. Field `name` attributes are Spanish because they become the email labels.

## Tailwind 4 specifics

There is **no `tailwind.config.mjs`**. All configuration is CSS-first in `src/styles/global.css`, imported once from `Layout.astro`: the `@import 'tailwindcss'`, the `@custom-variant dark`, and the `@theme` color scales. Content sources are auto-detected — there is no `content` array to maintain.

- **`@apply` inside an Astro scoped `<style>` requires `@reference`** at the top of that block, pointing at `global.css` *relative to the component* (`'../styles/global.css'` from `src/components/`). Without it Tailwind emits *nothing* and reports no error — the rule just silently does nothing. `AppHeader.astro`'s hamburger animation depends on this.
- **The important modifier is a suffix, not a prefix**: `visible!`, not `!visible`. A v3-style `!visible` is simply not a class.
- **Classes applied at runtime must appear verbatim in a source file.** The scanner reads text, it does not execute code — a class assembled from variables never gets generated.
- **The `dark:` variant carries no extra specificity.** `:where()` contributes zero, so `dark:bg-x` and `lg:bg-y` tie and source order decides — unlike v3, where `.dark &` always won. If a dark-mode color ever looks wrong on a responsive element, check this first.
- **`scale-*` sets the CSS `scale` property, not `transform`.** `getComputedStyle(el).transform` reads `none` even when a scale is applied.
- Renames already applied across the codebase, listed so old names don't creep back in: `shrink-0` / `grow-0` (not `flex-shrink-0` / `flex-grow-0`), `bg-linear-to-*` (not `bg-gradient-to-*`), `shadow-xs` (v3's `shadow-sm`), `rounded-sm` (v3's bare `rounded`).

## Astro 7 specifics

- **`compressHTML: true` is set deliberately in `astro.config.mjs` — do not remove it.** Astro 7 defaults to `'jsx'`, which drops whitespace between inline elements. Much of the hero and features copy separates words with a newline between a text node and a `<span>`, so the default renders `delimpiezayjardineríaque`. The build stays green; only looking at the page catches it.
- The compiler is Rust-based and validates HTML strictly: unclosed non-void tags are errors, and invalid nesting is no longer silently restructured.
- `pnpm-workspace.yaml` carries a `minimumReleaseAgeExclude` block that pnpm maintains itself for recently-published packages. Leave it alone.

## Conventions

- 2-space indent, single quotes, no semicolons (Astro/Prettier default here).
- Spanish UI copy, `lang='es'`. Ecuadorian phone/WhatsApp links live in `AppFooter.astro`.
- `astro:assets` for every raster image — never a bare `<img src>` to `src/images/`.
