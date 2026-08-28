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

Astro 7 + Tailwind 4. Images through `astro:assets` + `sharp`. Carousel is `embla-carousel`. Fonts are `@fontsource/archivo-black` (display) and `@fontsource/karla` (body). Deploy target is Cloudflare Pages (`wrangler` is the only devDependency).

`@astrojs/preact` is still configured but **no island uses it** — the theme toggle was the only one and it is gone. Ships nothing today; drop the integration if no island comes back.

Tailwind is wired as a **Vite plugin** (`@tailwindcss/vite` in `astro.config.mjs`), not an Astro integration. `@astrojs/tailwind` is gone and cannot come back — its peer range stops at `astro ^5` / `tailwindcss ^3`.

## Architecture

**One page.** `src/pages/index.astro` stacks section components inside `src/layouts/Layout.astro`:
`HeroSection` → `Features` → `Carousel` → `Form`, with `AppHeader` / `AppFooter` from the layout. Navigation is in-page anchors (`#servicios`, `#galeria`, `#formulario`, `#home`). `Container.astro` is the shared `max-w-7xl` horizontal wrapper — reuse it, don't re-declare the widths.

**The site is dark-only.** There is no `.dark` class, no `dark:` variant, no `localStorage.theme` and no toggle — every token in `global.css` is the one palette the page renders with. `<meta name='color-scheme' content='dark'>` and `color-scheme: dark` on `html` tell the browser so form controls and scrollbars match. Do not reintroduce a `dark:` variant for a one-off color; add a token instead.

**Colors.** `src/styles/global.css` defines everything under `@theme`:

- Two brand scales, unchanged from the original site: `primary` (teal) and `secondary` (warm tan). The design uses exactly two steps of them — `primary-400` (`#5fbad8`) is the main accent, `secondary-300` (`#d1aa8f`) the warm counterpoint. Teal leads; tan is reserved for gardening and for the closing "promise" bullet of each service card.
- Semantic, non-numeric tokens for everything else: surfaces (`canvas`, `surface`, `surface-sunken`, `surface-raised`, `surface-warm`), hairlines (`line`, `line-strong`), text from brightest to faintest (`ink-bright`, `ink`, `ink-soft`, `ink-muted`, `ink-dim`, `ink-faint`, `ink-ghost`) and `on-accent` for text sitting on an accent fill.
- Standalone hex tokens: `whatsapp` (`#24d165`, the contact links in `Form` and `AppFooter`) and `rhythm-dot` (the `rhythm-rule` dot colour).

They are named rather than numbered on purpose: the ramp has near-duplicate steps that numeric naming would have forced into `ink-750`-style nonsense. Reach for an existing token before inventing a hex.

**Radius.** `@theme` also defines a corner-radius scale: `rounded-field` (inputs), `rounded-tile` (the small icon squares), `rounded-card` (panels, cards, carousel viewport, mobile nav). Buttons stay `rounded-full`. Use these, not raw `rounded-xl`/`2xl`/`3xl`.

`rhythm-rule` is a custom `@utility` — the dotted band under the hero and in the contact panel, a nod to the guasá in the association's name.

**Section kicker.** `Eyebrow.astro` is the accent-rule-plus-uppercase-label that opens every section (`HeroSection`, `Features`, `Carousel`, `Form`). One component, one form — don't hand-roll the markup again.

**Scroll reveal.** `Layout.astro` ships a tiny IntersectionObserver: any element with class `reveal` fades/rises in when it scrolls into view. The hidden start state is scoped to `.js .reveal`, so it degrades to fully visible without JS, and `prefers-reduced-motion` disables it. `--reveal-delay` on the element staggers siblings (the service cards use it).

**Typography.** Display face is Archivo Black (`font-display`, applied to every heading by the global rule in `Layout.astro`); body is Karla. Both are self-hosted through `@fontsource`, imported in `Layout.astro`.

**Images.** Every gallery image is its own wrapper component under `src/components/images/`, named ordinally (`FirstImage.astro` … `FourteenthImage.astro`). Each wraps `astro:assets` `<Image>` with a fixed `widths` / `sizes` responsive recipe. `Carousel.astro` uses First–Sixth + Eleventh–Fourteenth, collected into a `slides` array and mapped over. Seventh–Tenth are currently unused: the redesigned service cards draw inline SVG icons instead of the old photographic ones. `HeroImage.astro` (same folder, not ordinal) is the team photo in the hero — it carries no layout classes; `HeroSection.astro`'s scoped `<style>` fills the frame via `:global(img)` because the unlayered global `img { height: auto }` outweighs Tailwind's layered `h-full` (same reason the carousel slides need their `:global` rule). To add a gallery image, create the next ordinal component and append it to `slides`. (Note: `FourthImage.astro` is imported as `ForthImage` in `Carousel.astro` — pre-existing typo, keep consistent if you touch it.)

**Carousel.** `src/components/Carousel.astro` owns the markup and loads behavior via `<script src='../carousel.js'>`. `src/carousel.js` is a plain DOM script (not a component) that `querySelector`s `.embla` and its children, wires the prev/next buttons, the dot row, the `01 / 10` snap counter, and the Embla `Autoplay` plugin (loop on, 3s delay — skipped entirely when `prefers-reduced-motion: reduce`). It assumes exactly one `.embla` on the page.

Three things there are load-bearing and easy to break:

- **Embla fires `init` synchronously inside `EmblaCarousel(...)`,** before any `.on('init', …)` you register afterwards. The dot row and the counter therefore call their builders by hand right after registering; a handler attached to `init` alone never runs.
- **The dot buttons are created at runtime,** so they never carry Astro's `data-astro-cid-*` scope attribute. Their styles live in `Carousel.astro`'s scoped `<style>` wrapped in `:global(...)` — without it the buttons exist, size to nothing, and vanish silently. The same applies to the `img` fill rule, since the ordinal wrappers render their own `<Image>`.
- **Ten dots do not fit on a phone** without wrapping to a second row, so they are `hidden sm:flex` and the counter carries the position below `sm`.

`AutoHeight` was dropped with the redesign: slides now have fixed responsive heights with `object-fit: cover`, which is what the design calls for and what auto-height fights.

**Header mobile nav.** `AppHeader.astro` uses a vanilla `<script>` that toggles `!`-suffixed important utility classes (`visible!`, `opacity-100!`, …) on `#navlinks` / `#hamburger` / `#navLayer`. State is a module-level `isToggled` boolean. Those classes reach the bundle **only because Tailwind's scanner finds them as string literals in this file** — see the Tailwind section below before refactoring them into a variable or building them dynamically.

**Contact form.** `Form.astro` posts directly to a Formspree endpoint (`action="https://formspree.io/f/..."`, plain `method="POST"`). No JS, no server route. Field `name` attributes are Spanish because they become the email labels.

## Tailwind 4 specifics

There is **no `tailwind.config.mjs`**. All configuration is CSS-first in `src/styles/global.css`, imported once from `Layout.astro`: the `@import 'tailwindcss'`, the `@theme` tokens and the `rhythm-rule` `@utility`. Content sources are auto-detected — there is no `content` array to maintain.

- **`@apply` inside an Astro scoped `<style>` requires `@reference`** at the top of that block, pointing at `global.css` *relative to the component* (`'../styles/global.css'` from `src/components/`). Without it Tailwind emits *nothing* and reports no error — the rule just silently does nothing. `AppHeader.astro`'s hamburger animation depends on this.
- **The important modifier is a suffix, not a prefix**: `visible!`, not `!visible`. A v3-style `!visible` is simply not a class.
- **Classes applied at runtime must appear verbatim in a source file.** The scanner reads text, it does not execute code — a class assembled from variables never gets generated. This is why `carousel.js` styles its runtime-built dots with a plain CSS class instead of utilities.
- **`scale-*` sets the CSS `scale` property, not `transform`.** `getComputedStyle(el).transform` reads `none` even when a scale is applied.
- Renames already applied across the codebase, listed so old names don't creep back in: `shrink-0` / `grow-0` (not `flex-shrink-0` / `flex-grow-0`), `bg-linear-to-*` (not `bg-gradient-to-*`), `shadow-xs` (v3's `shadow-sm`), `rounded-sm` (v3's bare `rounded`).

## Astro 7 specifics

- **`site` in `astro.config.mjs` is a placeholder (`asoafro.pages.dev`).** `Layout.astro` builds the canonical URL and the Open Graph / Twitter tags from it (`og:image` is `public/og-image.jpg`). Set it to the real domain once there is one.
- **`compressHTML: true` is set deliberately in `astro.config.mjs` — do not remove it.** Astro 7 defaults to `'jsx'`, which drops whitespace between inline elements. Much of the hero and features copy separates words with a newline between a text node and a `<span>`, so the default renders `delimpiezayjardineríaque`. The build stays green; only looking at the page catches it.
- The compiler is Rust-based and validates HTML strictly: unclosed non-void tags are errors, and invalid nesting is no longer silently restructured.
- `pnpm-workspace.yaml` carries a `minimumReleaseAgeExclude` block that pnpm maintains itself for recently-published packages. Leave it alone.

## Conventions

- 2-space indent, single quotes, no semicolons (Astro/Prettier default here).
- Spanish UI copy, `lang='es'`. Ecuadorian phone/WhatsApp links live in `AppFooter.astro`.
- `astro:assets` for every raster image — never a bare `<img src>` to `src/images/`.
