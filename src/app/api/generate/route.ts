import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { Cluster, SEOText, LocaleValue, LocaleConfig } from '@/types';
import { LOCALE_CONFIG } from '@/types';
import { parseClaudeJson } from '@/lib/parseJson';
import { getLocaleUrls } from '@/lib/sitemap';
import { COMPONENT_CSS } from '@/lib/componentCss';

function getLocaleConfig(locale?: string): LocaleConfig {
  return LOCALE_CONFIG[locale as LocaleValue] ?? LOCALE_CONFIG['de-DE'];
}

const client = new Anthropic();

function findRelevantUrls(keywords: string[], urls: string[], limit = 12): string[] {
  const terms = keywords
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 3);

  if (!terms.length) return urls.slice(0, limit);

  return urls
    .map((url) => {
      const slug = url
        .replace(/^https?:\/\/[^/]+/, '')
        .replace(/\//g, ' ')
        .toLowerCase();
      const score = terms.reduce((s, t) => s + (slug.includes(t) ? 1 : 0), 0);
      return { url, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.url);
}

function buildLocaleStyleRules(locale: string): string {
  const rules: string[] = [];

  if (locale.startsWith('en')) {
    rules.push(
      'ENGLISCHE STILREGELN (zwingend):',
      '- Keine Em-Dashes (—) verwenden — stattdessen Kommas, Doppelpunkte oder neue Sätze. Em-Dashes gelten im EN-Raum als typisches KI-Signal.',
      '- Kein "delve", "crucial", "it\'s important to note", "game-changer", "landscape" — typische KI-Phrasen vermeiden',
    );
  }

  if (locale.startsWith('nl')) {
    rules.push(
      'NIEDERLÄNDISCHE STILREGELN (zwingend):',
      '- Keine Gedankenstriche (—) verwenden — stattdessen Kommas oder neue Sätze',
      "- Keine französischen Anführungszeichen («»): immer einfache Apostrophe (')",
      '- Doppelpunkte (:) in H2-Überschriften: maximal 1 pro Artikel erlaubt',
      '- Kein "Quelle:" am Ende von FAQ-Antworten',
    );
  }

  if (locale.startsWith('fr')) {
    rules.push(
      'FRANZÖSISCHE STILREGELN (zwingend):',
      '- Keine Gedankenstriche (—) verwenden — stattdessen Kommas oder neue Sätze',
      '- Keine englischen KI-Phrasen wie "guide complet", "pas à pas", "tout ce que vous devez savoir"',
      '- Kein "Source:" oder "Quelle:" am Ende von FAQ-Antworten',
    );
  }

  if (rules.length === 0) return '';
  return '\n\n' + rules.join('\n');
}

function buildSystemBase(locale: string, lc: LocaleConfig): string {
  const langInstruction = lc.contentLang !== 'Deutsch'
    ? `\n\nSPRACHE: Schreibe den GESAMTEN Content auf ${lc.contentLang}. Alle Fließtexte, Überschriften, FAQs, CTAs — konsequent auf ${lc.contentLang}. WordPress-Shortcodes [vc_row] und HTML-Attribute bleiben unverändert.`
    : '';

  const currentDate = new Date().toISOString().split('T')[0];

  return `AKTUELLES DATUM: ${currentDate} — Das aktuelle Jahr ist ${new Date().getFullYear()}. Verwende ausschließlich dieses Jahr für alle Zeitangaben, Statistiken, "Stand"-Angaben und Formulierungen wie "aktuell", "heute", "derzeit" im generierten Content. Niemals ein früheres oder späteres Jahr verwenden.

Du bist ein erfahrener SEO- und GEO-Texter für MEDIAFIX (Digitalisierung & Datenrettung). Du schreibst Texte auf ${lc.contentLang}, die echten Mehrwert liefern und von KI-Modellen wie ChatGPT, Perplexity und Google AI Overviews als zitierwürdige Quelle erkannt werden.

CONTENT-RICHTLINIEN (alle zwingend):
1. Suchintent dual abdecken: Ratgeber-Teil zuerst, Service-CTA am Ende — sowohl informational als auch kommerziell
2. Semantische Keywords natürlich einbauen: Hauptkeyword + Variationen + Long-Tail-Problemszenarien — keine mechanische Wiederholung
3. Konkret und spezifisch: Befehle, Prozentwerte, Kostenrahmen, Produktnamen, Schwellenwerte — keine vagen Allgemeinaussagen
4. FAQ mit echten vollständigen Antworten: mindestens 5 Fragen mit substanziellem Inhalt
5. Externe Quellen sparsam verlinken: Maximal 3 externe Links pro Artikel, nur für quantitative Aussagen mit konkreten Zahlen oder Studiendaten. Format: <a href="URL" target="_blank" rel="noopener noreferrer">Quellentext</a>. Nur echte, erreichbare URLs verwenden.
6. Interne Verlinkungen vorschlagen: an relevanten Stellen auf verwandte MEDIAFIX-Servicepages hinweisen
7. Mindestens eine Schritt-für-Schritt-Anleitung pro Artikel (wo thematisch sinnvoll)
8. Alt-Texte keyword-relevant formulieren — kein generisches "Bild von..."
9. Direkte Antwort zuerst: erster Satz beantwortet Hauptfrage direkt (AI Direct Answer Signal)
10. keyTakeaways als 3-5 prägnante Fakten — direkt extrahierbar für AI-Snippets

JSON-AUSGABEREGELN (strikt einhalten):
- Antworte AUSSCHLIESSLICH mit dem rohen JSON-Objekt, kein Text davor oder danach, keine Markdown-Codeblöcke
- Keine Anführungszeichen (") innerhalb von String-Werten — Guillemets («») oder einfache Anführungszeichen (') verwenden
- Keine echten Zeilenumbrüche innerhalb von String-Werten
- Keine Backslashes außer als JSON-Escape-Sequenz

HTML-AUSGABEREGELN (strikt einhalten):
- Keine Leerzeilen zwischen HTML-Tags — jeder Tag beginnt direkt in der nächsten Zeile nach dem vorherigen schließenden Tag
- Keine Leerzeilen zwischen WordPress-Shortcodes und HTML-Elementen
- Leerzeilen innerhalb von [vc_column_text]-Blöcken erzeugen in WordPress leere Absätze — konsequent vermeiden${langInstruction}${buildLocaleStyleRules(locale)}`;
}

function buildBlogMetaPrompt(seedKeyword: string, cluster: Cluster, voiceSection: string, lc: LocaleConfig): string {
  return `Erstelle hochoptimierte SEO-Metadaten für einen ${lc.contentLang}-sprachigen Blog-Artikel über: ${seedKeyword}
Keyword-Cluster: "${cluster.name}" | Keywords: ${cluster.keywords.slice(0, 20).join(', ')}
${voiceSection}

METADATEN-REGELN (strikt einhalten):

SEO-TITLE (max. 60 Zeichen):
- Haupt-Keyword in den ersten 30 Zeichen platzieren (Google fettet Keyword-Matches → höhere CTR)
- Konkreten Mehrwert hinzufügen: Zahl, Zeitangabe, "kostenlos", "schnell", "vollständig" o.ä.
- Wettbewerber-Titles aus den SERP-Daten analysieren: bewusst differenzieren — wenn alle "günstig" nutzen, setze auf "zuverlässig"; wenn alle Listen-Formate nutzen, setze auf Frage-Format
- Kein Keyword-Stuffing, kein generisches "Ratgeber" oder "Alles über"
- Suchintent erkennbar machen: informationale Absicht → "Wie...", "Was...", "X Methoden"; kommerzielle Absicht → "Jetzt...", "Kosten im Überblick"
- KEIN "Liste + Jahr"-Format (z.B. "10 Methoden 2025") — wirkt KI-generiert

SEO-DESCRIPTION (max. 155 Zeichen):
- Haupt-Keyword aus dem Title nochmals aufgreifen (fette Hervorhebung in Google)
- Sekundäres Keyword oder Long-Tail-Begriff aus dem Cluster einbauen
- Konkretes Versprechen oder Zahl nennen, die im Title noch fehlt
- Expliziter CTA am Ende: nicht "Erfahren Sie mehr" sondern "Jetzt lesen →", "Kostenlos prüfen →", "Alle Details hier →"
- Keine leeren Phrasen: "umfassender Ratgeber", "hier erfahren Sie alles" sind verboten

H1 (darf länger sein als Title, max. 80 Zeichen):
- Kann emotional ansprechender formuliert sein als der Title
- Darf Frageform nutzen oder ein konkretes Problem ansprechen
- Muss Haupt-Keyword enthalten, muss aber nicht 1:1 mit Title übereinstimmen

URL-SLUG: Haupt-Keyword, Bindestriche, keine Stopwörter, max. 60 Zeichen

KEYTAKEAWAYS: 4 prägnante Fakten als direkte Antworten — konkrete Zahlen/Werte bevorzugen, keine allgemeinen Aussagen

Antworte NUR mit diesem JSON (ausschließlich kurze Strings, kein Nesting):
{
  "seoTitle": "...",
  "seoDescription": "...",
  "h1": "...",
  "urlSlug": "...",
  "keyTakeaways": ["Fakt 1", "Fakt 2", "Fakt 3", "Fakt 4"]
}`;
}

function buildBlogHtmlPrompt(seedKeyword: string, cluster: Cluster, meta: { h1: string; keyTakeaways: string[] }, voiceSection: string, lc: LocaleConfig): string {
  const takeaways = (meta.keyTakeaways ?? []).join(', ');
  return `Schreibe einen vollständigen informativen Blog-Artikel auf ${lc.contentLang} für WordPress Visual Composer.

Thema: ${seedKeyword} | H1: "${meta.h1}"
Cluster: "${cluster.name}" | Keywords: ${cluster.keywords.slice(0, 20).join(', ')}
Key Facts: ${takeaways}
${voiceSection}

STIL: 80% informativer Ratgeber, 20% MEDIAFIX-Empfehlung am Ende. Kein Verkaufstext im Hauptteil.
GEO: Erster Satz beantwortet Hauptfrage direkt. Fachbegriffe definieren. Spezifische Zahlen.
MEDIAFIX: Experte für Digitalisierung und Datenrettung, über 10 Mio. digitalisierte Medien.

Ausgabe: Zuerst den vollständigen WordPress-Quellcode, dann — nach dem letzten [/vc_row] — die strukturierten Daten im folgenden Delimiter-Format (kein JSON):

###FAQ_FRAGE###
[Frage 1 als Conversational Query]
###FAQ_ANTWORT###
[Antwort 1, 60-80 Wörter, KEINE Quellenangabe am Ende]

###FAQ_FRAGE###
[Frage 2]
###FAQ_ANTWORT###
[Antwort 2, 60-80 Wörter, KEINE Quellenangabe am Ende]

###FAQ_FRAGE###
[Frage 3]
###FAQ_ANTWORT###
[Antwort 3, 60-80 Wörter, KEINE Quellenangabe am Ende]

###FAQ_FRAGE###
[Frage 4]
###FAQ_ANTWORT###
[Antwort 4, 60-80 Wörter, KEINE Quellenangabe am Ende]

###FAQ_FRAGE###
[Frage 5]
###FAQ_ANTWORT###
[Antwort 5, 60-80 Wörter, KEINE Quellenangabe am Ende]

###IMAGE###
Position: Nach der Einleitung
Beschreibung: [Was zeigt das Bild?]
AltText: [SEO Alt-Text max. 120 Zeichen]
Firefly: [English prompt: subject, style, lighting, background]

###IMAGE###
Position: Im Hauptteil
Beschreibung: [...]
AltText: [...]
Firefly: [...]

###IMAGE###
Position: Vor dem MEDIAFIX-Abschnitt
Beschreibung: [...]
AltText: [...]
Firefly: [...]

LÄNGENVORGABEN — Qualität vor Länge, keine Füllsätze:
- Orientiere dich an der Tiefe/Länge der Wettbewerber (Analysebasis im Kontext)
- Schreibe so ausführlich wie das Thema es erfordert — nicht kürzer, nicht länger
- 4–6 H2-Abschnitte + MEDIAFIX-Abschnitt (KEIN FAQ im HTML — wird separat ergänzt)
- Pro Abschnitt: so viele Wörter wie nötig für vollständige, nutzwertige Erklärung
- Mind. 1 Vergleichstabelle oder Schritt-Anleitung wo thematisch sinnvoll
- Artikel MUSS vollständig mit dem MEDIAFIX-Block und CTA-Button enden

STRUKTUR — H3-Unterüberschriften:
- Abschnitte mit mehr als ~250 Wörtern Fließtext MÜSSEN mit H3-Unterüberschriften gegliedert werden
- H3-Format: <h3 id="[slug]">[Unterüberschrift]</h3> — kurz, prägnant, keyword-nah
- Abschnitte unter ~150 Wörtern brauchen keine H3s
- H3s helfen der semantischen Indexierung und der Snippet-Extraktion durch KI-Systeme

ANTI-KI-MUSTER (zwingend vermeiden):
- Nicht jede H2 in exakt 2-3 H3 unterteilen — Struktur muss dem Inhalt folgen, nicht umgekehrt
- Nicht alle Themen auf einer Seite abhandeln — Keyword-Fokus halten
- Bullet-Listen: maximal 5 Punkte, unterschiedliche Länge, unterschiedliche Satzstruktur
- Keine sich wiederholenden oder inhaltlich leeren Phrasen

KEYWORD-VORGABEN:
- Das Haupt-Keyword oder direkte Varianten in mindestens 3 von 6 H2-Überschriften
- Keyword natürlich in den ersten 100 Wörtern nennen

QUELLENANGABEN (wichtig — immer als klickbare Links):
- Alle quantitativen Aussagen mit einem HTML-Link belegen: <a href="URL" target="_blank" rel="noopener noreferrer">Quellentext</a>
- Geeignete Quellen: Hersteller-Dokumentation (Seagate, WD, Samsung, Toshiba), IDEMA, NVMe Express, Bitkom, BSI, Fraunhofer, IEEE, University-Studien
- Nur echte, erreichbare URLs verwenden — keine erfundenen Links
- Für MEDIAFIX-eigene Erfahrungswerte: "nach unserer Erfahrung aus über X Mio. Aufträgen" (kein Link nötig)
- Keine unbelegten Prozentzahlen oder Zeitangaben ohne Quellenlink

FORMAT — NUR Artikelinhalt, KEIN Inhaltsverzeichnis und KEINE FAQ (werden automatisch eingefügt):
[vc_row][vc_column][vc_column_text css=""]
<strong>[1-2 Sätze fettgedruckter Teaser]</strong>

<hr />

<h2 id="[slug1]">[Abschnitt 1 — Keyword im Titel]</h2>
[280-400 Wörter. Tabellen, Listen, konkrete Details.]

[Für nummerierte Schritt-Abschnitte — EXAKT dieses Muster, WICHTIG: [vc_column_text] VOR dem [vc_row_inner] schließen:]
[/vc_column_text][vc_row_inner][vc_column_inner width="1/6"][vc_column_text css=""]
<p style="text-align: center;"><span style="font-size: 40px; color: #90ad25; font-weight: 800;">1</span></p>
[/vc_column_text][/vc_column_inner][vc_column_inner width="5/6"][vc_column_text css=""]
<strong>Schritt-Titel:</strong> Beschreibung mit praktischem Hinweis (2-3 Sätze).
[/vc_column_text][/vc_column_inner][/vc_row_inner][vc_row_inner][vc_column_inner width="1/6"][vc_column_text css=""]
<p style="text-align: center;"><span style="font-size: 40px; color: #90ad25; font-weight: 800;">2</span></p>
[/vc_column_text][/vc_column_inner][vc_column_inner width="5/6"][vc_column_text css=""]
<strong>Schritt-Titel:</strong> Beschreibung.
[/vc_column_text][/vc_column_inner][/vc_row_inner][vc_column_text css=""]
[weiterer Inhalt nach den Schritten...]

[Infoboxen:] [vc_message message_box_color="grey" css=""]Inhalt[/vc_message]
[Vergleiche:] <ul class="advantages"><li>Vorteil</li></ul> / <ul class="disadvantages"><li>Nachteil</li></ul>

<h2 id="mediafix">Wann lohnt sich professionelle Hilfe?</h2>
[Natürliche MEDIAFIX-Empfehlung, 80 Wörter]
MEDIAFIX hat Erfahrung aus über [mf-counter show="media" round="on"] Millionen digitalisierten Medien.

Haben Sie Fragen? Tel.: [cgv telefon_kundenservice]
Mo-Do [cgv öffnungszeiten1] | Fr [cgv öffnungszeiten2]

<a class="button" href="https://mediafix.de/">[passender CTA-Text]</a>
[/vc_column_text][/vc_column][/vc_row]

PFLICHT-STRUKTUR (wird automatisch geprüft — Fehlen bricht TOC und FAQ-Injektion):
1. <strong>[Teaser]</strong> direkt am Artikelanfang
2. <hr /> unmittelbar nach dem Teaser — NICHT weglassen, NICHT verschieben
3. Alle H2-Überschriften mit id-Attribut: <h2 id="[kebab-slug]">
4. Letzter H2 MUSS exakt lauten: <h2 id="mediafix"> — kein anderes id, kein anderer Text davor
5. Artikel endet mit: <a class="button" href="https://mediafix.de/">...</a>[/vc_column_text][/vc_column][/vc_row]`;
}

function buildServiceMetaPrompt(seedKeyword: string, cluster: Cluster, voiceSection: string, lc: LocaleConfig): string {
  return `Erstelle hochoptimierte SEO-Metadaten auf ${lc.contentLang} für eine Service-/Landingpage über: ${seedKeyword}
Keyword-Cluster: "${cluster.name}" | Keywords: ${cluster.keywords.slice(0, 20).join(', ')}
${voiceSection}

METADATEN-REGELN (strikt einhalten):

SEO-TITLE (max. 60 Zeichen):
- Haupt-Keyword in den ersten 30 Zeichen — Google fettet Matches, das steigert die CTR direkt
- Transaktionalen Mehrwert hinzufügen: Preisspanne, "schnell", "professionell", "vor Ort", Garantie
- Wettbewerber-Titles aus den SERP-Daten analysieren: welches Muster dominiert? Davon abweichen
- Kein Keyword-Stuffing, kein generisches "Service" oder "Dienstleistung" als Füllwort
- Lokalen oder kommerziellen Intent klar signalisieren

SEO-DESCRIPTION (max. 155 Zeichen):
- Haupt-Keyword aufgreifen (fette Hervorhebung in der SERP steigert Klickrate)
- Konkretes USP nennen, das im Title nicht steht: Reaktionszeit, Preisvorteil, Erfahrungswert, Garantie
- Sekundäres Keyword oder Standort-Begriff einbauen wenn relevant
- Starker CTA am Ende: "Jetzt Angebot anfragen →", "Kostenlose Beratung →", "Direkt beauftragen →"
- Verboten: "Erfahren Sie mehr", "Klicken Sie hier", "umfangreiche Lösungen"

H1 (max. 70 Zeichen, darf anders formuliert sein als Title):
- Darf eine konkrete Kundennutzen-Aussage sein: "X Problem? Wir lösen es in Y Stunden"
- Muss Haupt-Keyword enthalten, kann aber emotionaler oder spezifischer sein als der Title

URL-SLUG: Haupt-Keyword, Bindestriche, keine Stopwörter, max. 60 Zeichen

KEYTAKEAWAYS: 4 konkrete Service-Fakten — Reaktionszeiten, Preisrahmen, Erfahrungswerte, Garantien bevorzugen

Antworte NUR mit diesem JSON (kurze Strings, kein Nesting):
{
  "seoTitle": "...",
  "seoDescription": "...",
  "h1": "...",
  "urlSlug": "...",
  "keyTakeaways": ["Fakt 1", "Fakt 2", "Fakt 3", "Fakt 4"]
}`;
}

function buildServiceContentPrompt(seedKeyword: string, contentType: string, cluster: Cluster, meta: Pick<SEOText, 'h1' | 'keyTakeaways'>, voiceSection: string, lc: LocaleConfig): string {
  return `Schreibe den Textinhalt auf ${lc.contentLang} für eine ${contentType}-Seite über: ${seedKeyword}
H1: "${meta.h1}" | Keywords: ${cluster.keywords.slice(0, 20).join(', ')}
Key Facts: ${(meta.keyTakeaways ?? []).join(', ')}
${voiceSection}

GEO: Erster Satz beantwortet Hauptfrage direkt. Spezifische Zahlen. Fachbegriffe definieren.

Antworte EXAKT in diesem Format mit den Trennzeichen (kein JSON, kein Markdown):

###INTRO###
[150-200 Wörter. Erster Satz = direkte Antwort auf die Hauptfrage.]

###USP###
[USP 1: konkreter messbarer Vorteil]

###USP###
[USP 2]

###USP###
[USP 3]

###USP###
[USP 4]

###USP###
[USP 5]

###PREISE###
[120-160 Wörter. Realistische Preisspannen mit Zahlen, 3-4 Einflussfaktoren.]

###HOW###
[150-200 Wörter. 4-5 Schritte mit je einem praktischen Hinweis.]

###URSACHEN###
[150-200 Wörter. Sachlich, Fachbegriffe definieren.]

###FAQ_FRAGE###
[Conversational Query wie in ChatGPT/Perplexity]
###FAQ_ANTWORT###
[60-90 Wörter direkte Antwort mit konkreten Infos]

###FAQ_FRAGE###
[Frage 2]
###FAQ_ANTWORT###
[Antwort 2]

###FAQ_FRAGE###
[Frage 3]
###FAQ_ANTWORT###
[Antwort 3]

###FAQ_FRAGE###
[Frage 4]
###FAQ_ANTWORT###
[Antwort 4]

###FAQ_FRAGE###
[Frage 5]
###FAQ_ANTWORT###
[Antwort 5]

###IMAGE###
Position: Nach der Einleitung
Beschreibung: [Was zeigt das Bild konkret?]
AltText: [SEO-optimierter Alt-Text, max. 120 Zeichen]
Firefly: [English Firefly prompt: subject, style, lighting, background]

###IMAGE###
Position: Im Hauptteil
Beschreibung: [...]
AltText: [...]
Firefly: [...]

###IMAGE###
Position: Vor dem CTA
Beschreibung: [...]
AltText: [...]
Firefly: [...]

###CTA###
[60-80 Wörter. Konkreter nächster Schritt mit Zeitrahmen.]`;
}

// ── TOC + FAQ builder (server-side, data-driven) ─────────────────────────────

function buildTocJs(lc: LocaleConfig): string {
  const script = `<script>document.addEventListener('click',function(e){if(!e.target.closest('.mf-toc__header'))return;var t=document.getElementById('mfToc');var l=t.querySelector('.mf-toc__toggle');t.classList.toggle('collapsed');l.textContent=t.classList.contains('collapsed')?'${lc.tocToggleShow}':'${lc.tocToggleHide}';});</script>`;
  return Buffer.from(script, 'utf8').toString('base64');
}

const FAQ_JS = Buffer.from(
  `<script>document.addEventListener('click',function(e){var q=e.target.closest('.mf-faq__question');if(!q)return;var item=q.closest('.mf-faq__item');var isOpen=item.classList.contains('open');document.querySelectorAll('.mf-faq__item.open').forEach(function(el){if(el!==item)el.classList.remove('open');});item.classList.toggle('open',!isOpen);});</script>`,
  'utf8'
).toString('base64');


function cleanArticleHtml(html: string): string {
  const delimIdx = html.indexOf('###');
  let text = delimIdx > 0 ? html.slice(0, delimIdx) : html;

  // Markdown-Überschriften entfernen
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Leerzeilen zwischen HTML-Tags entfernen — WP rendert \n\n als leere <p>-Tags
  text = text.replace(/>\s*\n(\s*\n)+\s*</g, '>\n<');

  // Leerzeilen zwischen schließendem Tag und Shortcode / zwischen Shortcodes
  text = text.replace(/\]\s*\n(\s*\n)+\s*\[/g, ']\n[');
  text = text.replace(/\]\s*\n(\s*\n)+\s*</g, ']\n<');
  text = text.replace(/>\s*\n(\s*\n)+\s*\[/g, '>\n[');

  // Verbleibende 3+ Leerzeilen auf max. eine reduzieren
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

function extractH2s(html: string): Array<{ id: string; text: string }> {
  const results: Array<{ id: string; text: string }> = [];
  const re = /<h2[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text) results.push({ id: m[1], text });
  }
  return results;
}

function buildTocHtml(headings: Array<{ id: string; text: string }>, faqCount: number, lc: LocaleConfig): string {
  const readMins = Math.max(4, Math.round((headings.length * 3 + faqCount) * 0.8));
  const items = headings.map((h, i) =>
    `      <li class="mf-toc__item${i === 0 ? ' mf-toc__item--highlight' : ''}">` +
    `<a href="#${h.id}" class="mf-toc__link">` +
    `<span class="mf-toc__text">${h.text}</span>` +
    `<span class="mf-toc__arrow">›</span></a></li>`
  );
  if (faqCount > 0) {
    items.push(
      '      <li class="mf-toc__item"><a href="#faq" class="mf-toc__link">' +
      `<span class="mf-toc__text">${lc.faqHeadline}</span>` +
      '<span class="mf-toc__arrow">›</span></a></li>'
    );
  }
  return `<nav class="mf-toc" id="mfToc" aria-label="${lc.tocTitle}">
  <div class="mf-toc__header" role="button" aria-expanded="true">
    <span class="mf-toc__title">${lc.tocTitle}</span>
    <span class="mf-toc__toggle">${lc.tocToggleHide}</span>
  </div>
  <div class="mf-toc__body">
    <ol class="mf-toc__list">
${items.join('\n')}
    </ol>
    <div class="mf-toc__footer"><span class="mf-toc__meta">${lc.readTimeFn(readMins)}</span></div>
  </div>
</nav>`;
}

function buildFaqHtml(faq: Array<{ question: string; answer: string }>, lc: LocaleConfig): string {
  if (!faq.length) return '';
  const items = faq.map(f => `  <div class="mf-faq__item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
    <div class="mf-faq__question">
      <span class="mf-faq__q-text" itemprop="name">${f.question}</span>
      <span class="mf-faq__icon"></span>
    </div>
    <div class="mf-faq__answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
      <div class="mf-faq__a-inner" itemprop="text">${f.answer}</div>
    </div>
  </div>`).join('\n');

  return `<div class="mf-faq" id="faq" itemscope itemtype="https://schema.org/FAQPage">
  <h2 class="mf-faq__headline">${lc.faqHeadline}</h2>
${items}
</div>`;
}

function buildExpertBox(bio: string, lc: LocaleConfig): string {
  const cleanBio = bio.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').trim();
  return `[/vc_column_text][/vc_column][/vc_row]
[vc_row][vc_column][vc_column_text css=""]
<div class="mf-expert" itemscope itemtype="https://schema.org/Person">
  <div class="mf-expert__inner">
    <div class="mf-expert__sidebar">
      <div class="mf-expert__avatar">AH</div>
      <div class="mf-expert__badge">${lc.expertBadge}</div>
    </div>
    <div class="mf-expert__body">
      <span class="mf-expert__label">${lc.expertLabel}</span>
      <p class="mf-expert__name" itemprop="name">Artem Honcharenko</p>
      <p class="mf-expert__title" itemprop="jobTitle">${lc.expertJobTitle}</p>
      <div class="mf-expert__divider"></div>
      <p class="mf-expert__quote" itemprop="description">
        <span class="mf-expert__quote-mark">&#8222;</span>
        ${cleanBio}
      </p>
    </div>
  </div>
</div>
[/vc_column_text][/vc_column][/vc_row]
[vc_row][vc_column][vc_column_text css=""]`;
}

function vcImageBlock(img?: { altText?: string; fireflyPrompt?: string }): string {
  const alt = img?.altText ?? '';
  const firefly = img?.fireflyPrompt ?? '';
  return [
    `[/vc_column_text][/vc_column][/vc_row]`,
    firefly ? `<!-- Firefly Prompt: ${firefly} -->` : '',
    `[vc_row][vc_column][vc_single_image image="" img_size="full" alignment="center" css="" alt="${alt}"][/vc_column][/vc_row]`,
    `[vc_row][vc_column][vc_column_text css=""]`,
  ].filter(Boolean).join('\n');
}

function removeEmptyVcBlocks(html: string): string {
  let out = html;
  // Leere [vc_column_text ...][/vc_column_text]-Blöcke entfernen
  out = out.replace(/\[vc_column_text[^\]]*\]\s*\[\/vc_column_text\]/g, '');
  // Leere [vc_row][vc_column][/vc_column][/vc_row]-Blöcke entfernen
  out = out.replace(/\[vc_row[^\]]*\]\s*\[vc_column[^\]]*\]\s*\[\/vc_column\]\s*\[\/vc_row\]/g, '');
  // Aufeinderfolgende Leerzeilen normalisieren
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

function injectTocAndFaq(
  html: string,
  faq: Array<{ question: string; answer: string }>,
  lc: LocaleConfig,
  images: Array<{ position: string; altText: string; fireflyPrompt: string }> = [],
  expertBio?: string
): string {
  const headings = extractH2s(html);
  const toc = buildTocHtml(headings, faq.length, lc);

  // 1. TOC + optionale Expertenbox nach <hr />
  const expertBlock = expertBio ? `\n\n${buildExpertBox(expertBio, lc)}` : '';
  let result = html.replace('<hr />', `<hr />\n\n${toc}${expertBlock}`);

  // 2. Bild 1 nach <hr /> + TOC (vor erster H2)
  const img1 = images[0];
  if (img1) {
    result = result.replace(/(<h2\s+id="[^"]+">)/, `${vcImageBlock(img1)}\n$1`);
  }

  // 3. Bild 2 nach der 3. H2-Überschrift
  const img2 = images[1];
  if (img2) {
    let h2Count = 0;
    result = result.replace(/<h2\s+id="[^"]+">/g, (match) => {
      h2Count++;
      if (h2Count === 3) return `${vcImageBlock(img2)}\n${match}`;
      return match;
    });
  }

  // 4. FAQ + Bild 3 vor <h2 id="mediafix">
  const img3 = images[2];
  const faqHtml = faq.length > 0 ? buildFaqHtml(faq, lc) : '';
  const img3Block = img3 ? `${vcImageBlock(img3)}\n` : '';
  result = result.replace(
    /<h2[^>]*id="mediafix"[^>]*>/,
    `${faqHtml}\n\n${img3Block}<h2 id="mediafix">`
  );

  // 5. CSS + JS-Blöcke
  const cssB64 = Buffer.from(`<style>${COMPONENT_CSS}</style>`, 'utf8').toString('base64');
  result += `\n[vc_row][vc_column][vc_raw_html]${cssB64}[/vc_raw_html][/vc_column][/vc_row]`;
  result += `\n[vc_row][vc_column][vc_raw_html]${buildTocJs(lc)}[/vc_raw_html][/vc_column][/vc_row]`;
  result += `\n[vc_row][vc_column][vc_raw_html]${FAQ_JS}[/vc_raw_html][/vc_column][/vc_row]`;

  return result;
}

// ── Schema.org server-seitig (Node.js Buffer — korrekte UTF-8 Base64, kein btoa-Bug) ─
function encodeSchemaBlock(obj: object): string {
  const json = JSON.stringify(obj, null, 2);
  const script = `<script type="application/ld+json">\n${json}\n</script>`;
  const b64 = Buffer.from(script, 'utf8').toString('base64');
  return `[vc_row][vc_column][vc_raw_html css=""]${b64}[/vc_raw_html][/vc_column][/vc_row]`;
}

function buildBlogSchemas(
  h1: string,
  seoDescription: string,
  faq: Array<{ question: string; answer: string }>,
  isoDate: string,
  articleHtml: string
): string {
  const blocks: string[] = [];

  // FAQPage
  if (faq.length > 0) {
    blocks.push(encodeSchemaBlock({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    }));
  }

  // HowTo — automatisch aus Step-Blöcken extrahiert
  const howToBlock = buildHowToSchema(articleHtml);
  if (howToBlock) blocks.push(howToBlock);

  // BlogPosting
  blocks.push(encodeSchemaBlock({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: h1,
    description: seoDescription,
    datePublished: isoDate,
    dateModified: isoDate,
    author: {
      '@type': 'Person',
      name: 'Artem Honcharenko',
      jobTitle: 'Datenrettungsexperte',
      worksFor: { '@type': 'Organization', name: 'MEDIAFIX', url: 'https://mediafix.de' },
    },
    publisher: { '@type': 'Organization', name: 'MEDIAFIX', url: 'https://mediafix.de' },
  }));

  return blocks.join('\n');
}

// ── HowTo-Schema: Step-Blöcke aus VC-HTML extrahieren ────────────────────────
// Erkennt das [vc_row_inner]-Muster mit nummerierten Spans und <strong>Titel:</strong>
function extractHowToSteps(html: string): Array<{ name: string; text: string }> {
  const steps: Array<{ name: string; text: string }> = [];
  // Jeder Step-Block: [vc_row_inner]...[/vc_row_inner]
  const rowInnerRe = /\[vc_row_inner\]([\s\S]*?)\[\/vc_row_inner\]/g;
  let m: RegExpExecArray | null;
  while ((m = rowInnerRe.exec(html)) !== null) {
    const block = m[1];
    // Muss eine Schrittnummer enthalten (font-size: 40px)
    if (!block.includes('font-size: 40px')) continue;
    // Inhaltsspalte (5/6): Text nach dem zweiten [vc_column_text]
    const contentCol = block.match(/width="5\/6"\]\[vc_column_text[^\]]*\]([\s\S]*?)\[\/vc_column_text\]/);
    if (!contentCol) continue;
    const inner = contentCol[1].trim();
    // Titel aus <strong>Titel:</strong>
    const titleMatch = inner.match(/<strong>([^<]+?):?<\/strong>/);
    const name = titleMatch ? titleMatch[1].replace(/:$/, '').trim() : `Schritt ${steps.length + 1}`;
    // Volltext ohne HTML-Tags
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (text) steps.push({ name, text });
  }
  return steps;
}

// Findet die H2-Überschrift, die dem ersten Step-Block am nächsten vorausgeht
function findHowToName(html: string): string {
  const firstStep = html.search(/\[vc_row_inner\][\s\S]*?font-size: 40px/);
  if (firstStep === -1) return 'Schritt-für-Schritt-Anleitung';
  const before = html.slice(0, firstStep);
  const h2s: RegExpExecArray[] = [];
  const h2re = /<h2[^>]*>([\s\S]*?)<\/h2>/g;
  let h2m: RegExpExecArray | null;
  while ((h2m = h2re.exec(before)) !== null) h2s.push(h2m);
  if (!h2s.length) return 'Schritt-für-Schritt-Anleitung';
  const last = h2s[h2s.length - 1];
  return last[1].replace(/<[^>]+>/g, '').trim();
}

function buildHowToSchema(html: string, pageUrl = 'https://mediafix.de/'): string | null {
  const steps = extractHowToSteps(html);
  if (steps.length < 2) return null; // Kein HowTo ohne mind. 2 Schritte

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: findHowToName(html),
    step: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${pageUrl}#schritt-${i + 1}`,
    })),
  };
  return encodeSchemaBlock(schema);
}

function parseImageBlock(block: string): import('@/types').ImagePlaceholder | null {
  const get = (label: string) => {
    const m = block.match(new RegExp(`${label}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };
  const position = get('Position');
  if (!position) return null;
  return {
    position,
    description: get('Beschreibung'),
    altText: get('AltText'),
    fireflyPrompt: get('Firefly'),
  };
}

function parseInternalLinkBlock(block: string): import('@/types').InternalLink | null {
  const get = (label: string) => {
    const m = block.match(new RegExp(`${label}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };
  const anchorText = get('Ankertext');
  if (!anchorText) return null;
  return {
    anchorText,
    urlSuggestion: get('URL-Vorschlag'),
    position: get('Position'),
  };
}

function parseContentBlocks(raw: string): Partial<SEOText> {
  const result: Partial<SEOText> = { usps: [], faq: [], images: [], internalLinks: [] };
  const blockRegex = /###([A-Z_]+)###\r?\n([\s\S]*?)(?=###[A-Z_]+###|$)/g;
  let match: RegExpExecArray | null;
  let pendingQuestion = '';

  while ((match = blockRegex.exec(raw)) !== null) {
    const key = match[1];
    const value = match[2].trim().replace(/\n{3,}/g, '\n\n');
    switch (key) {
      case 'INTRO':        result.intro = value; break;
      case 'USP':          result.usps!.push(value); break;
      case 'PREISE':       result.preise = value; break;
      case 'HOW':          result.howItWorks = value; break;
      case 'URSACHEN':     result.ursachen = value; break;
      case 'CTA':          result.cta = value; break;
      case 'EXPERT_BIO':   result.expertBio = value.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').trim(); break;
      case 'FAQ_FRAGE':    pendingQuestion = value.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').trim(); break;
      case 'FAQ_ANTWORT':
        result.faq!.push({
          question: pendingQuestion,
          answer: value.replace(/^#+\s*/gm, '').replace(/\*\*/g, '').trim(),
        });
        pendingQuestion = '';
        break;
      case 'IMAGE': {
        const img = parseImageBlock(value);
        if (img) result.images!.push(img);
        break;
      }
      case 'INTERNAL_LINK': {
        const link = parseInternalLinkBlock(value);
        if (link) result.internalLinks!.push(link);
        break;
      }
    }
  }
  return result;
}

function injectInternalLinks(
  html: string,
  links: Array<{ anchorText: string; urlSuggestion: string }>
): string {
  if (!links.length) return html;

  const usedUrls = new Set<string>();

  for (const link of links) {
    if (!link.anchorText || !link.urlSuggestion || usedUrls.has(link.urlSuggestion)) continue;

    const href = link.urlSuggestion.startsWith('http')
      ? link.urlSuggestion
      : `https://mediafix.de${link.urlSuggestion}`;

    const escaped = link.anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const anchorRe = new RegExp(`\\b${escaped}\\b`, 'i');

    // Split into HTML-tag segments and text segments, only replace in text nodes
    const parts = html.split(/(<[^>]+>)/);
    let injected = false;
    let insideAnchor = 0;

    const newParts = parts.map((part) => {
      if (injected) return part;
      if (/^<[^>]+>$/.test(part)) {
        if (/^<a\b/i.test(part)) insideAnchor++;
        else if (/^<\/a>/i.test(part)) insideAnchor = Math.max(0, insideAnchor - 1);
        return part;
      }
      if (insideAnchor > 0) return part;
      const match = part.match(anchorRe);
      if (match) {
        injected = true;
        return part.replace(anchorRe, `<a href="${href}">${match[0]}</a>`);
      }
      return part;
    });

    if (injected) {
      html = newParts.join('');
      usedUrls.add(link.urlSuggestion);
    }
  }

  return html;
}

async function removeDeadExternalLinks(html: string): Promise<string> {
  const linkRe = /<a\s+[^>]*href="(https?:\/\/(?!mediafix\.|mediafixdigitale\.)[^"]+)"[^>]*>[\s\S]*?<\/a>/gi;
  const matches: Array<{ full: string; url: string; innerText: string }> = [];

  let m: RegExpExecArray | null;
  const re = new RegExp(linkRe.source, linkRe.flags);
  while ((m = re.exec(html)) !== null) {
    const innerText = m[0].replace(/<[^>]+>/g, '').trim();
    matches.push({ full: m[0], url: m[1], innerText });
  }

  if (!matches.length) return html;

  const checks = await Promise.allSettled(
    matches.map(async ({ url }) => {
      const res = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        redirect: 'follow',
      });
      return { url, status: res.status };
    })
  );

  let result = html;
  checks.forEach((check, i) => {
    // Nur bei bestätigten HTTP-Fehlercodes entfernen.
    // Netzwerkfehler (ECONNREFUSED, Timeout etc.) = Link behalten — wir können nicht sicher sein.
    const DEAD_CODES = new Set([404, 410, 451]);
    const isDead = check.status === 'fulfilled' && DEAD_CODES.has(check.value.status);
    if (isDead) {
      result = result.replace(matches[i].full, matches[i].innerText);
    }
  });

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { cluster, contentType, voiceTranscript, referenceUrl, seedKeyword, serpResults, competitorContent, locale, existingImages }: {
      cluster: Cluster;
      contentType: string;
      voiceTranscript: string;
      referenceUrl?: string;
      seedKeyword: string;
      serpResults?: Array<{ position: number; title: string; url: string; description: string }>;
      competitorContent?: Array<{ url: string; text: string }>;
      locale?: string;
      existingImages?: import('@/types').ImagePlaceholder[];
    } = await req.json();
    const lc = getLocaleConfig(locale);

    const voiceSection = voiceTranscript?.trim()
      ? `\nHINWEISE VOM NUTZER: "${voiceTranscript}"`
      : '';

    const serpSection = serpResults?.length
      ? `\nAKTUELLE TOP-${serpResults.length} GOOGLE-ERGEBNISSE:\n` +
        serpResults.map((r) => `#${r.position} ${r.title} (${new URL(r.url).hostname})`).join('\n')
      : '';

    const avgCompWords = competitorContent?.length
      ? Math.round(competitorContent.reduce((s, c) => s + c.text.split(/\s+/).length, 0) / competitorContent.length)
      : 0;

    const competitorSection = competitorContent?.length
      ? `\nCONTENT-GAP-ANALYSE (Top-${competitorContent.length} Wettbewerber — aktiver Arbeitsauftrag):\n` +
        `Ziel-Texttiefe: ~${avgCompWords} Wörter — nicht als Füllvorgabe, sondern als Mindestmaß für vollständige Abdeckung.\n\n` +
        competitorContent.map((c, i) =>
          `--- Konkurrent ${i + 1}: ${new URL(c.url).hostname} ---\n${c.text.slice(0, 2000)}`
        ).join('\n\n') +
        `\n\nDEINE AUFGABE AUS DIESER ANALYSE:\n` +
        `1. Identifiziere Teilthemen und Nutzerfragen, die die Wettbewerber ansprechen, aber in deinem Artikel noch fehlen.\n` +
        `2. Integriere diese Lücken als eigenständige Inhalte — tiefer und konkreter als die Wettbewerber, nie oberflächlich.\n` +
        `3. Übernimm KEINEN Text wörtlich. Wo Wettbewerber vage bleiben, liefere spezifische Zahlen, Schritte oder Erklärungen.\n` +
        `4. Ergänze nur, was den Suchintent des Nutzers wirklich weiterbringt — kein Fülltext, kein Wiederholen bereits genannter Punkte.`
      : '';

    const isBlog = contentType === 'blog_post';

    if (isBlog) {
      // Pass 1: nur 4 kurze JSON-Felder
      const metaMsg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: buildSystemBase(locale ?? 'de-DE', lc),
        messages: [{ role: 'user', content: buildBlogMetaPrompt(seedKeyword, cluster, voiceSection + serpSection + competitorSection, lc) }],
      });
      const metaRaw = metaMsg.content[0].type === 'text' ? metaMsg.content[0].text : '';
      const meta = parseClaudeJson<Pick<SEOText, 'seoTitle' | 'seoDescription' | 'urlSlug' | 'h1' | 'keyTakeaways'>>(metaRaw);

      // Pass 2: Artikel-HTML (kein FAQ, kein TOC — mehr Token-Budget für Inhalt)
      const htmlMsg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: buildSystemBase(locale ?? 'de-DE', lc) + '\n\nAUSGABEFORMAT: Nur WordPress Visual Composer HTML-Quellcode. Kein JSON, kein Markdown, kein erklärender Text.',
        messages: [{ role: 'user', content: buildBlogHtmlPrompt(seedKeyword, cluster, { h1: meta.h1 ?? '', keyTakeaways: meta.keyTakeaways ?? [] }, voiceSection + serpSection + competitorSection, lc) }],
      });
      const rawHtml = htmlMsg.content[0].type === 'text' ? htmlMsg.content[0].text.trim() : '';

      // Pass 3: FAQ + Bildprompts (eigener Pass, garantiert vollständig)
      const localeUrls = await getLocaleUrls(locale ?? 'de-DE');
      const relevantUrls = findRelevantUrls([seedKeyword, ...cluster.keywords], localeUrls);
      const faqMsg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: `Du bist ein SEO-Texter und Bild-Redakteur. Schreibe auf ${lc.contentLang}. Antworte EXAKT im ###BLOCK###-Format. Kein JSON, kein Markdown.`,
        messages: [{
          role: 'user',
          content: `Thema: ${seedKeyword} | Cluster: "${cluster.name}"

RELEVANTE MEDIAFIX-SEITEN FÜR INTERNE VERLINKUNG (nur aus dieser Liste wählen):
${relevantUrls.map(u => `- ${u}`).join('\n')}

TEIL 0 — Expertenbox (1 Block):

###EXPERT_BIO###
[1-2 Sätze auf ${lc.contentLang} — themenspezifische Qualifikation des MEDIAFIX-Experten. Konkret: welche Geräte/Schäden er besonders oft behandelt, typische Fallzahlen. Kein Deutsch verwenden, wenn die Zielsprache nicht Deutsch ist.]

TEIL 1 — Interne Verlinkungsvorschläge (2-3 Stück):

###INTERNAL_LINK###
Ankertext: [sinnvoller Linktext]
URL-Vorschlag: /[relativer-pfad]
Position: [wo im Artikel]

###INTERNAL_LINK###
Ankertext: [...]
URL-Vorschlag: /[...]
Position: [...]

TEIL 2 — 5 FAQ-Einträge (Conversational Queries, Antworten 60-80 Wörter, KEINE Quellenangabe am Ende):

###FAQ_FRAGE###
[Frage 1]
###FAQ_ANTWORT###
[Antwort 1]

###FAQ_FRAGE###
[Frage 2]
###FAQ_ANTWORT###
[Antwort 2]

###FAQ_FRAGE###
[Frage 3]
###FAQ_ANTWORT###
[Antwort 3]

###FAQ_FRAGE###
[Frage 4]
###FAQ_ANTWORT###
[Antwort 4]

###FAQ_FRAGE###
[Frage 5]
###FAQ_ANTWORT###
[Antwort 5]

TEIL 2 — 3 Bildplatzhalter (Firefly-Prompts auf Englisch, professionell, kommerziell):

###IMAGE###
Position: Nach der Einleitung
Beschreibung: [Was zeigt das Bild konkret?]
AltText: [SEO Alt-Text max. 120 Zeichen]
Firefly: [professional photo, subject, lighting, background, style — max. 20 Wörter]

###IMAGE###
Position: Im Hauptteil
Beschreibung: [...]
AltText: [...]
Firefly: [...]

###IMAGE###
Position: Vor dem MEDIAFIX-Abschnitt
Beschreibung: [...]
AltText: [...]
Firefly: [...]`,
        }],
      });
      const faqRaw = faqMsg.content[0].type === 'text' ? faqMsg.content[0].text : '';
      const faqParsed = parseContentBlocks(faqRaw);

      // Bilder aus vorherigem Artikel wiederverwenden falls vorhanden (Locale-Rerun)
      const images = existingImages?.length ? existingImages : (faqParsed.images ?? []);

      // TOC, FAQ, Bilder und Expertenbox server-seitig injizieren
      const isoDate = new Date().toISOString().split('T')[0];

      // Referenz-URL als höchstprioritären internen Link vorschalten
      const referenceLink = referenceUrl?.trim()
        ? await (async () => {
            try {
              const res = await fetch(referenceUrl, { signal: AbortSignal.timeout(5000) });
              const html = await res.text();
              const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
              const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
              const anchor = (h1?.[1] ?? title?.[1]?.split(/[|–—-]/)[0] ?? '')
                .replace(/&amp;/g, '&').trim().slice(0, 60);
              return anchor ? [{ anchorText: anchor, urlSuggestion: referenceUrl, position: '' }] : [];
            } catch { return []; }
          })()
        : [];

      const checkedHtml = injectInternalLinks(
        await removeDeadExternalLinks(cleanArticleHtml(rawHtml)),
        [...referenceLink, ...(faqParsed.internalLinks ?? [])]
      );
      let articleHtml = removeEmptyVcBlocks(injectTocAndFaq(
        checkedHtml,
        faqParsed.faq ?? [],
        lc,
        images,
        faqParsed.expertBio
      ));
      // Referenz-URL immer in CTA-Button einsetzen
      if (referenceUrl?.trim()) {
        articleHtml = articleHtml.replace(
          /<a(\s+class="button"\s+href=")https:\/\/mediafix\.de\/"/g,
          `<a$1${referenceUrl}"`
        );
      }

      const schemas = buildBlogSchemas(
        meta.h1 ?? '',
        meta.seoDescription ?? '',
        faqParsed.faq ?? [],
        isoDate,
        articleHtml
      );
      const htmlOutput = `${articleHtml}\n${schemas}`;

      return NextResponse.json({
        seoText: {
          seoTitle: meta.seoTitle ?? '',
          seoDescription: meta.seoDescription ?? '',
          urlSlug: meta.urlSlug ?? '',
          h1: meta.h1 ?? '',
          keyTakeaways: meta.keyTakeaways ?? [],
          intro: '',
          images,
          usps: [],
          preise: '',
          howItWorks: '',
          ursachen: '',
          faq: faqParsed.faq ?? [],
          expertBio: faqParsed.expertBio,
          internalLinks: faqParsed.internalLinks ?? [],
          cta: '',
          htmlOutput,
        } satisfies SEOText,
      });
    }

    // Service-Seiten: Two-Pass (JSON für kurze Metadaten, Delimiter-Format für langen Inhalt)
    const metaMsg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: buildSystemBase(locale ?? 'de-DE', lc),
      messages: [{ role: 'user', content: buildServiceMetaPrompt(seedKeyword, cluster, voiceSection + serpSection + competitorSection, lc) }],
    });
    const metaRaw = metaMsg.content[0].type === 'text' ? metaMsg.content[0].text : '';
    const meta = parseClaudeJson<Pick<SEOText, 'seoTitle' | 'seoDescription' | 'urlSlug' | 'h1' | 'keyTakeaways'>>(metaRaw);

    const contentMsg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: `Du bist ein SEO-Texter. Schreibe auf ${lc.contentLang}. Halte dich exakt an das vorgegebene Format mit ###BLOCK###-Trennzeichen. Kein JSON, kein Markdown.`,
      messages: [{ role: 'user', content: buildServiceContentPrompt(seedKeyword, contentType, cluster, meta, voiceSection + serpSection + competitorSection, lc) }],
    });
    const contentRaw = contentMsg.content[0].type === 'text' ? contentMsg.content[0].text : '';
    const content = parseContentBlocks(contentRaw);

    const seoText: SEOText = {
      seoTitle: meta.seoTitle ?? '',
      seoDescription: meta.seoDescription ?? '',
      urlSlug: meta.urlSlug ?? '',
      h1: meta.h1 ?? '',
      keyTakeaways: meta.keyTakeaways ?? [],
      images: content.images ?? [],
      intro: content.intro ?? '',
      usps: content.usps ?? [],
      preise: content.preise ?? '',
      howItWorks: content.howItWorks ?? '',
      ursachen: content.ursachen ?? '',
      faq: content.faq ?? [],
      cta: content.cta ?? '',
    };

    return NextResponse.json({ seoText });
  } catch (err) {
    console.error('[/api/generate]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
