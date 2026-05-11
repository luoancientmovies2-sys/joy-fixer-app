## What you uploaded

A "Media Mirror" streaming app: 23 public pages (Home, Movies, TV Series, Watch, Search, Trending, About, Contact, etc.), 13 admin pages (Dashboard, Movies, Series, Episodes, Users, Subscriptions, Hero Slides, Adverts, Apps, Settings, Transactions, Activities), Auth + Admin contexts, Supabase integration, a Pesapal payments edge function, and Firebase. Built on Vite + React 18 + react-router-dom + Tailwind v3.

This workspace runs TanStack Start + React 19 + Tailwind v4 + Lovable Cloud. So I have to port, not just copy.

## Strategy

To keep this tractable and avoid rewriting every `<Link>` and `useNavigate` call, I'll do a **bridged port**: keep the original `react-router-dom` routing inside a single TanStack catch-all route. This preserves nearly all original page code unchanged, while satisfying the TanStack shell.

## Steps

1. **Dependencies**
   - Add: `react-router-dom`, `@supabase/supabase-js`, `firebase`, `embla-carousel-react`, `vaul`, `@radix-ui/react-toast`, `cmdk`, `recharts`, `next-themes`, `react-day-picker`, `date-fns`, `react-hook-form`, `@hookform/resolvers`, `zod`, `tailwindcss-animate`, `@tailwindcss/typography`, `vite-plugin-pwa`, `input-otp`, `react-resizable-panels`, plus any missing radix packages.
   - Check missing shadcn `ui/toaster.tsx` and add it (the template only ships `sonner`).

2. **Design tokens (Tailwind v3 → v4)**
   - Rewrite `src/styles.css`: keep the dark streaming palette (red/orange primary), convert HSL tokens to oklch, port keyframes (shimmer, gradient-shift, slide/zoom/blur/marquee/easter-blink-fade), helper component classes (`nav-link`, `gradient-primary`, `gradient-subscribe`, `skeleton-pulse`).
   - Map `hsl(var(--x))` patterns to `var(--x)` consumed by the existing `@theme inline` block.

3. **Source migration**
   - Copy `src/components/**`, `src/contexts/**`, `src/data/**`, `src/hooks/**`, `src/lib/**`, `src/integrations/**`, `src/assets/**`, `public/**` from the upload into the project (overwriting where appropriate).
   - Keep `src/App.tsx` mostly intact (it already wires `BrowserRouter`, `Routes`, contexts, query client).

4. **TanStack shell adaptation**
   - Strip the QueryClientProvider/BrowserRouter from the original `App.tsx` (keep contexts, providers, Routes).
   - Replace `src/routes/index.tsx` with a `_$` splat route that simply renders `<App />` so every path is handled by react-router-dom underneath.
   - Update `src/routes/__root.tsx` so `<HeadContent />` and `<Scripts />` remain, and the splat route has no SSR data dependencies.
   - Set the splat route to `ssr: false` to dodge SSR issues with `localStorage`/`window` used by Supabase/Firebase/AuthContext.
   - Remove the placeholder `notFoundComponent`/built-in 404 conflict by letting react-router-dom handle 404.

5. **Lovable Cloud / Supabase**
   - Enable Lovable Cloud (creates a fresh Supabase project + env). The app's tables (`movies`, `series`, `episodes`, `profiles`, `subscriptions`, `hero_slides`, `adverts`, `apps`, `transactions`, `activities`, `settings`, etc.) are NOT migrated automatically — they'll need schema migrations in a follow-up step. I'll note which tables/RLS the code expects so we can recreate them.
   - The Pesapal Supabase edge function won't run on Lovable Cloud as-is; I'll leave it under `supabase/functions/pesapal/index.ts` for reference, and we can re-implement as a TanStack server route in a later step if needed.
   - Firebase: keep the SDK in place; you'll need to provide your own config secrets.

6. **Verify**
   - Build via the harness; fix import/typing errors that surface (especially missing shadcn pieces, react 18 → 19 quirks like `forwardRef` and ref-as-prop changes, react-day-picker v8 incompatibilities).

## Caveats / things this plan does NOT do

- No data migration — your existing Supabase tables and storage buckets aren't here. The new Cloud project starts empty.
- Pesapal edge function is left as reference code; payments won't work until re-implemented.
- Firebase keys must be re-supplied as secrets if you want Firebase features active.
- Tailwind v4 may render a few utilities differently; I'll fix visible regressions as we spot them.
- This is a large port — expect a follow-up message or two for cleanup after the first build.

Approve and I'll execute step-by-step.
