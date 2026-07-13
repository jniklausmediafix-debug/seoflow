# SEOFlow

KI-gestützte SEO-Texterstellung für MEDIAFIX: Keyword-Recherche, SERP- & Wettbewerbsanalyse, semantisches Clustering, mehrsprachige Text-Generierung und Sprachkorrektur – in einem geführten 6-Phasen-Wizard.

## Tech Stack

| Schicht | Technologie |
|---------|-------------|
| Framework | Next.js 14 (App Router) |
| Sprache | TypeScript |
| Styling | Tailwind CSS |
| Keyword- & SERP-Daten | DataForSEO (Google Ads Keywords + Google Organic SERP) |
| KI-Texterstellung | Anthropic Claude (`claude-sonnet-4-6`) |
| Sprach-zu-Text | OpenAI Whisper (`whisper-1`) |
| Deployment | Vercel |

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

## User Flow (6 Phasen)

```
Phase 1  →  Seed-Keyword eingeben + Zielmarkt/Sprache wählen
Phase 2  →  Keyword-Chips filtern (klicken = ausblenden)
Phase 3  →  Semantischen Cluster auswählen (oder mehrere zusammenführen)
Phase 4  →  Content-Typ wählen + optionaler Voice-Input & Referenz-URL
Phase 5  →  Generierten SEO-Text ansehen + kopieren (inkl. HTML-Export)
Phase 6  →  Whisper-Nachkorrektur einsprechen → Text überarbeiten
```

In Phase 1 laufen Keyword-Recherche und SERP-Analyse **parallel**; der Content der Top-3-Wettbewerber wird anschließend im Hintergrund gescraped und in die Text-Generierung eingespeist.

Aus Phase 5 heraus kann dasselbe Thema direkt **in einer anderen Sprache** neu generiert werden – bereits erzeugte Bild-Platzhalter werden dabei übernommen.

## Mehrsprachigkeit

SEOFlow unterstützt 10 Zielmärkte mit eigener DataForSEO-Location, Whisper-Sprache, Content-Sprache und lokalisierten UI-Texten (Inhaltsverzeichnis, FAQ-Headline, Experten-Badge etc.). Konfiguriert in `LOCALE_CONFIG` in [`src/types/index.ts`](src/types/index.ts):

`de-DE` · `de-AT` · `de-CH` · `en-GB` · `nl-NL` · `nl-BE` · `fr-FR` · `fr-BE` · `fr-CH` · `it-IT`

Interne Verlinkungs-Vorschläge werden je Locale aus den MEDIAFIX-Sitemaps gezogen (`src/lib/sitemap.ts`).

## API-Routes

| Route | Methode | Beschreibung |
|-------|---------|--------------|
| `/api/keywords` | POST | DataForSEO Google Ads: bis zu 60 Keyword-Ideen für Seed-Keyword |
| `/api/serps` | POST | DataForSEO Google Organic: Top-10 SERP-Ergebnisse |
| `/api/competitors` | POST | Scraped den sichtbaren Text der Wettbewerber-URLs (max. 5) |
| `/api/cluster` | POST | Claude: Keywords in semantische Cluster gruppieren |
| `/api/generate` | POST | Claude: SEO-Text nach festem Schema erzeugen |
| `/api/revise` | POST | Claude: Text anhand von Feedback überarbeiten |
| `/api/transcribe` | POST | Whisper: Audio-Blob → Text |

### Request-Beispiele

**POST /api/keywords** · **POST /api/serps**
```json
{ "seedKeyword": "Datenrettung Festplatte", "locale": "de-DE" }
```

**POST /api/competitors**
```json
{ "urls": ["https://konkurrent-a.de/...", "https://konkurrent-b.de/..."] }
```

**POST /api/cluster**
```json
{ "keywords": ["datenrettung festplatte", "festplatte klickt", "hdd reparatur kosten"] }
```

**POST /api/generate**
```json
{
  "cluster": { "id": "1", "name": "Preise & Kosten", "keywords": [], "description": "" },
  "contentType": "blog_post",
  "voiceTranscript": "Bitte betone die kostenlose Diagnose.",
  "referenceUrl": "https://...",
  "seedKeyword": "Datenrettung Festplatte",
  "serpResults": [],
  "competitorContent": [],
  "locale": "de-DE"
}
```

**POST /api/revise**
```json
{
  "currentText": { "h1": "...", "intro": "..." },
  "feedback": "Der Intro-Absatz ist zu lang, bitte kürzen.",
  "clusterKeywords": ["..."],
  "locale": "de-DE"
}
```

**POST /api/transcribe** — `multipart/form-data` mit `audio`-Feld (Blob) und optionalem `locale`-Feld.

## SEO-Text Schema

Claude generiert jeden Text als strukturiertes JSON (`SEOText` in [`src/types/index.ts`](src/types/index.ts)):

| Feld | Inhalt |
|------|--------|
| `seoTitle` / `seoDescription` | Meta-Title & -Description |
| `urlSlug` | Vorschlag für den URL-Slug |
| `h1` | Hauptüberschrift mit Haupt-Keyword |
| `intro` | Einleitung mit Top-Keywords |
| `keyTakeaways` | Kernaussagen als Bullet-Liste |
| `images` | Bild-Platzhalter mit Alt-Text & Firefly-Prompt |
| `usps` | Unique Selling Points |
| `preise` | Typische Preisspannen & Einflussfaktoren |
| `howItWorks` | Schritt-für-Schritt-Ablauf |
| `ursachen` | Hintergrund / Problemstellung |
| `faq` | Fragen mit Antworten |
| `cta` | Call to Action |
| `expertBio` | Experten-Hinweis (E-E-A-T) |
| `internalLinks` | Interne Verlinkungs-Vorschläge aus der Sitemap |
| `htmlOutput` | Fertiges HTML zum direkten Kopieren |

## Projektstruktur

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       ├── keywords/route.ts     # DataForSEO Keyword Ideas
│       ├── serps/route.ts        # DataForSEO Organic SERP
│       ├── competitors/route.ts  # Wettbewerber-Content-Scraper
│       ├── cluster/route.ts      # Claude Clustering
│       ├── generate/route.ts     # Claude Text-Generierung
│       ├── revise/route.ts       # Claude Überarbeitung
│       └── transcribe/route.ts   # Whisper Transkription
├── components/
│   ├── StepWizard.tsx            # Haupt-Wizard mit State
│   ├── LoaderScreen.tsx          # Animierter Lade-Screen
│   ├── steps/
│   │   ├── Step1Keywords.tsx
│   │   ├── Step2KeywordChips.tsx
│   │   ├── Step3Clusters.tsx
│   │   ├── Step4VoiceInput.tsx
│   │   ├── Step5Generate.tsx
│   │   └── Step6Revise.tsx
│   └── ui/
│       └── AudioRecorder.tsx     # Mikrofon-Aufnahme + Transkription
├── lib/
│   ├── sitemap.ts               # Interne Link-URLs je Locale
│   ├── componentCss.ts          # CSS für den HTML-Export
│   └── parseJson.ts             # Robustes JSON-Parsing der Claude-Antworten
└── types/
    └── index.ts                 # Typen, Content-Typen, Locales, LOCALE_CONFIG
```

## Produktions-Build

```bash
npm run build
npm start
```

Deployment erfolgt über Vercel (`.vercel/` ist bereits verknüpft). Die vier Environment-Variablen müssen im Vercel-Projekt hinterlegt sein.
