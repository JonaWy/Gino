# Gino – Pferde-Management PWA

Deutschsprachige Web-App zur Verwaltung deines Pferdes: Dashboard, Kalender, Turnier- und Vital-Historie, Kosten-Forecast und mehr.

## Features

- **Dashboard** – Pferdebild, Stammdaten, nächster Termin mit Kostenschätzung
- **Kalender** – Termine (Impfung, Tierarzt, Schmied, Turnier, Training) mit Kosten
- **Kosten-Forecast** – Monatsprognose, Ist-Historie, Durchschnittswerte
- **Turniere** – Historie mit Bewertung, Reiter und Preisgeld
- **Vitalwerte** – Gewicht, Stockmaß, Turniergewinne, geschätzter Wert (Charts)
- **Gesundheit** – Impfungen, Entwurmung mit Fälligkeits-Tracking
- **Training** – Trainingslog
- **Dokumente** – Upload mit Ablauf-Erinnerungen
- **Kontakte** – Tierarzt, Schmied, Stall (Tel-Link)
- **PWA** – Installierbar auf dem Handy

## Setup

### 1. Supabase-Projekt

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Führe die Migration aus: `supabase/migrations/001_initial_schema.sql` (SQL Editor)
3. Erstelle Storage-Buckets:
   - `horse-images` (öffentlich)
   - `documents` (privat)

### 2. Umgebungsvariablen

```bash
cp .env.local.example .env.local
```

Trage ein:

```
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

### 3. Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000), registriere dich – ein Pferd „Gino“ wird automatisch angelegt.

## Lizenz

Kommerzielle proprietäre Lizenz – siehe [LICENSE](LICENSE). Nutzung, Weitergabe und kommerzielle Verwertung nur mit schriftlicher Genehmigung.

## Tech-Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Storage)
- Recharts
