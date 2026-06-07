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

### 1. Supabase-Projekt (bereits eingerichtet)

- **Projekt:** [Gino auf Supabase](https://supabase.com/dashboard/project/dovigxelwheqdvqonezj)
- **Region:** eu-central-1
- **Schema:** Alle Tabellen, RLS-Policies und Storage-Buckets sind migriert

### 2. Umgebungsvariablen

Die Datei `.env.local` ist bereits mit den Projekt-Keys konfiguriert. Für neue Entwickler:

```bash
cp .env.local.example .env.local
```

Dann die Werte aus dem [Supabase Dashboard](https://supabase.com/dashboard/project/dovigxelwheqdvqonezj/settings/api) eintragen.

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
