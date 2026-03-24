# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm i          # Install dependencies
npm run dev    # Start development server (Vite, http://localhost:5173)
npm run build  # Production build
```

No linting or test commands are configured.

## Architecture

This is a React + Vite + TypeScript UI prototype exported from Figma, representing an **Azure AI Governance Platform** — a security/compliance dashboard for enterprise AI agents.

**Routing** (`src/app/App.tsx`): Three pages via React Router v7:
- `/` → `LandingPage` — marketing landing page
- `/chat` → `ChatInterface` — AI agent chat UI
- `/dashboard` → `CybersecurityDashboard` — governance/audit dashboard

**Component layers:**
- `src/app/components/ui/` — shadcn/ui primitives (Radix UI + Tailwind). Do not modify these; they are auto-generated.
- `src/app/components/figma/` — Figma-specific utilities (e.g., `ImageWithFallback`)
- `src/app/components/` — page-level components (`LandingPage`, `ChatInterface`, `CybersecurityDashboard`, `AppNavbar`)

**Styling:**
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (not a `tailwind.config.js` setup)
- CSS custom properties defined in `src/styles/theme.css` — this is the source of truth for colors, radius, and typography scale
- Brand primary color: `#0078D4` (Azure blue); hover: `#106EBE`
- `src/styles/index.css` imports fonts, tailwind, and theme in order

**Path alias:** `@` resolves to `src/` (configured in `vite.config.ts`)

**Key dependencies:** `recharts` for charts, `react-hook-form` for forms, `lucide-react` for icons, `motion` for animations, `react-dnd` for drag-and-drop, `sonner` for toasts.
