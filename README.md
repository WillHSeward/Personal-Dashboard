# Personal Dashboard

A native Windows desktop "command center" — a dark, glanceable dashboard that
pulls together your school deadlines, important dates, live Premier League and
World Cup data, Clash Royale stats, and local weather, all in one window.

Built with **Electron + React + Tailwind + Framer Motion**, with a small local
Node/TypeScript backend and a **SQLite** store. The React frontend never calls
external APIs directly — it only talks to the local backend over Electron IPC:

```
External APIs ─▶ Integration modules ─▶ Cache ─▶ Local data API (IPC) ─▶ React UI
```

## Features

- **Important dates** — countdown chips for birthdays, trips, deadlines (add/edit/delete, stored locally)
- **Due soon** — your assignments / exams / projects with relative due times
- **Premier League** — full live table (badges, W/L, GD, Champions League / Europa / relegation colors, your team starred) plus fixtures in the next 7 days
- **World Cup** — upcoming matches, group standings with flags, top scorers, and a knockout bracket
- **Clash Royale** — your ranked league, seasonal arena + trophies, win rate, and current deck
- **Weather** — current conditions for your city with an hour-by-hour hover forecast
- Live clock, manual refresh for football, quiet auto-refresh for weather + Clash

## Prerequisites

- **Windows** (the build targets Windows; dev works anywhere Electron runs)
- **Node.js 18+**

## Setup

```bash
git clone <your-repo-url>
cd "Personal Dashboard"
npm install
cp .env.example .env      # then edit .env with your keys (see below)
npm run dev               # launch the app in development
```

> On Windows, `npm install` runs a `postinstall` step that rebuilds the native
> SQLite module against Electron's runtime. That's expected.

## API keys

Put these in your local `.env` (copied from `.env.example`). Everything is
free, and **weather needs no key at all**.

| Key | Where to get it | Notes |
| --- | --- | --- |
| `FOOTBALL_API_KEY` | [football-data.org/client/register](https://www.football-data.org/client/register) | Free tier: 10 requests/min, covers PL + World Cup |
| `CR_API_KEY` | [developer.clashroyale.com](https://developer.clashroyale.com) | The key is **locked to a whitelisted IP** — use your home IP |
| `CR_PLAYER_TAG` | In-game, under your name (e.g. `#ABC123`) | **Must be quoted** in `.env` — the leading `#` is otherwise a comment |

If a key is missing, that panel simply shows a "set this key" hint instead of
crashing — so you can run with only the parts you want.

## Personalize it

A few values are hardcoded — change these to make it yours:

| What | File | Change |
| --- | --- | --- |
| Greeting name ("Good evening, **Will**") | `src/renderer/src/components/Topbar.tsx` | edit the `greeting` text |
| Weather location (coordinates) | `src/main/integrations/weather.ts` | set `LAT` / `LON` to your city |
| Weather city label ("**Evanston** · …") | `src/renderer/src/components/Topbar.tsx` | edit the two `Evanston` strings |
| Your football team (the ⭐) | `src/main/integrations/football.ts` | set `MY_TEAM` to your club's full name (e.g. `"Arsenal FC"`) |
| App icon | `build/icon.png` | replace with a 512×512 PNG (the `.ico` is generated on build) |

Due dates, important dates, and Clash deck are managed inside the app and saved
to SQLite (`dashboard.db` in your user-data folder) — no code changes needed.

## Build a standalone installer

```bash
npm run dist
```

This produces `dist/Dashboard Setup x.y.z.exe` — an installer you can run and
pin like any Windows app. It bundles your `.env`, so **don't share the
installer** (it contains your keys).

Windows notes:
- The app is **unsigned**, so SmartScreen will warn on first run — click
  **More info → Run anyway**.
- If the build fails extracting `winCodeSign` ("cannot create symbolic link"),
  enable **Windows Developer Mode** (Settings → Privacy & security → For
  developers) and rebuild — that grants the symlink permission it needs.

## Tech stack

Electron · electron-vite · React 18 · Tailwind v4 · Framer Motion · better-sqlite3 ·
football-data.org · Supercell Clash Royale API · Open-Meteo

## License

Personal project — use it however you like.
