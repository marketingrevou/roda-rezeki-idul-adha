# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
```

No test suite is configured.

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_SECRET=...
```

## Architecture

**Roda Rezeki** is a one-time spin-the-wheel Ramadan promo app for RevoU. Each email can only spin once. Results are picked server-side to prevent manipulation.

### User Flow

1. **Landing** (`app/page.tsx`) — user enters email → `POST /api/check-email` → if new, stores email in `sessionStorage` and navigates to `/spin`; if returning, shows their previous result inline.
2. **Spin** (`app/spin/page.tsx`) — reads email from `sessionStorage` (redirects home if missing) → user clicks spin → `POST /api/save-result` picks and persists the result → returns `result` + `segmentIndex` → wheel animates to the winning segment → `ResultDisplay` modal shows the prize.
3. **Admin** (`app/admin/page.tsx`) — password-protected page (client-side, `Bearer ADMIN_SECRET` header) that lists all spins and supports CSV export.

### API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/check-email` | POST | Queries Supabase `spins` table for email; returns `{ exists, result }` |
| `/api/save-result` | POST | Picks result via `pickResult()`, inserts into `spins`, returns `{ result, segmentIndex }`. Returns 409 if email already exists (enforced by unique constraint + code `23505`) |
| `/api/admin` | GET | Protected by `Authorization: Bearer ADMIN_SECRET`; returns all rows from `spins` ordered by `created_at` desc |

### Key Files

- **`lib/segments.ts`** — defines `SEGMENTS` array (label, probability, color) and `pickResult()` which does weighted random selection. Edit this to change prizes or probabilities. Probabilities must sum to 100.
- **`lib/supabase.ts`** — lazily-initialized singleton Supabase client using the service role key (server-side only; never expose this to the browser).
- **`components/Wheel.tsx`** — canvas-based wheel rendered with `requestAnimationFrame`. Loaded via `dynamic(..., { ssr: false })` because it uses the browser Canvas API. Accepts `targetIndex` (which segment to land on), `spinning` (triggers animation), and `onSpinComplete` callback.
- **`components/ResultDisplay.tsx`** — full-screen modal overlay shown after spin completes.

### Supabase Table: `spins`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `email` | text | Unique constraint enforces one spin per email |
| `result` | text | Label from `SEGMENTS` |
| `created_at` | timestamptz | Auto-set |

### Styling

- Dark navy (`#0f0a2e`) background throughout; gold (`#FFDE3D`) accents.
- Custom CSS classes in `globals.css`: `.star-item` (twinkling stars), `.crescent` (moon shape), `.text-gold-gradient`, `.glow-border`, `.lantern-float`.
- Tailwind extended with `navy`, `gold`, `gold-dark` colors and `poppins` font family.
- Inline styles are used heavily for one-off color values that don't map to Tailwind classes.
