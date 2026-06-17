# SEOFlow

KI-gestützte SEO-Texterstellung mit Keyword-Recherche, semantischem Clustering und Sprachkorrektur.

## Tech Stack

| Schicht | Technologie |
|---------|-------------|
| Framework | Next.js 14 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS |
| Keyword-Daten | DataForSEO Keywords Data API |
| KI-Texterstellung | Anthropic Claude (claude-sonnet-4-6) |
| Sprach-zu-Text | OpenAI Whisper (whisper-1) |

## Schnellstart

### 1. Dependencies installieren

```bash
cd seoflow
npm install
```

### 2. Umgebungsvariablen konfigurieren

Kopiere `.env.example` nach `.env.local` und trage deine API-Keys ein:

```bash
cp .env.example .env.local
```

```env
DATAFORSEO_LOGIN=dein_login@example.com
DATAFORSEO_PASSWORD=dein_passwort
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

**API-Accounts:**
- DataForSEO: https://dataforseo.com (Trial-Account reicht zum Testen)
- Anthropic: https://console.anthropic.com
- OpenAI: https://platform.openai.com

### 3. Dev-Server starten

```bash
npm run dev
```

App ist erreichbar unter: http://localhost:3000

## API-Routes

| Route | Methode | Beschreibung |
|-------|---------|--------------|
| `/api/keywords` | POST | DataForSEO: Keyword Ideas für Seed-Keyword |
| `/api/cluster` | POST | Claude: Keywords in 3–5 semantische Cluster |
| `/api/generate` | POST | Claude: SEO-Text nach festem Schema |
| `/api/revise` | POST | Claude: Text anhand von Feedback überarbeiten |
| `/api/transcribe` | POST | Whisper: Audio-Blob → Text |

### Request-Beispiele

**POST /api/keywords**
```json
{ "seedKeyword": "Dachdecker Wien", "locationName": "Austria", "languageName": "German" }
```

**POST /api/cluster**
```json
{ "keywords": ["dachdecker wien", "dachdeckung kosten", "dach reparatur"] }
```

**POST /api/generate**
```json
{
  "cluster": { "id": "1", "name": "Preise & Kosten", "keywords": [...], "description": "..." },
  "contentType": "service_page",
  "voiceTranscript": "Bitte betone die 10-Jahres-Garantie.",
  "seedKeyword": "Dachdecker Wien"
}
```

**POST /api/revise**
```json
{
  "currentText": { "h1": "...", "intro": "...", ... },
  "feedback": "Der Intro-Absatz ist zu lang, bitte kürzen."
}
```

**POST /api/transcribe** — `multipart/form-data` mit `audio`-Feld (Blob)

## SEO-Text Schema

Claude generiert jeden Text nach diesem festen Schema:

| Abschnitt | Inhalt |
|-----------|--------|
| **H1** | Hauptüberschrift mit Haupt-Keyword |
| **Intro** | 150–200 Wörter, enthält Top-Keywords |
| **USPs** | 5 Unique Selling Points |
| **Preise** | Typische Preisspannen & Einflussfaktoren |
| **How it works** | 3–5-Schritte-Ablauf |
| **Ursachen** | Hintergrund / Problemstellung |
| **FAQ** | 5 Fragen mit Antworten |
| **CTA** | Call to Action |

## User Flow (6 Phasen)

```
Phase 1  →  Seed-Keyword eingeben
Phase 2  →  Keyword-Chips filtern (klicken = ausblenden)
Phase 3  →  Semantischen Cluster auswählen
Phase 4  →  Content-Typ wählen + optionaler Whisper-Vorab-Input
Phase 5  →  Generierten SEO-Text ansehen + kopieren
Phase 6  →  Whisper-Nachkorrektur einsprechen → Text überarbeiten
```

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── keywords/route.ts   # DataForSEO
│       ├── cluster/route.ts    # Claude Clustering
│       ├── generate/route.ts   # Claude Text-Generierung
│       ├── revise/route.ts     # Claude Überarbeitung
│       └── transcribe/route.ts # Whisper Transkription
├── components/
│   ├── StepWizard.tsx          # Haupt-Wizard mit State
│   ├── steps/
│   │   ├── Step1Keywords.tsx
│   │   ├── Step2KeywordChips.tsx
│   │   ├── Step3Clusters.tsx
│   │   ├── Step4VoiceInput.tsx
│   │   ├── Step5Generate.tsx
│   │   └── Step6Revise.tsx
│   └── ui/
│       └── AudioRecorder.tsx   # Mikrofon-Aufnahme + Transkription
└── types/
    └── index.ts
```

## Produktions-Build

```bash
npm run build
npm start
```
