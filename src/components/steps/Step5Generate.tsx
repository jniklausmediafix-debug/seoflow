'use client';

import { useState } from 'react';
import type { SEOText, LocaleValue } from '@/types';
import { LOCALES } from '@/types';
import { COMPONENT_CSS } from '@/lib/componentCss';

interface Props {
  seoText: SEOText;
  currentLocale: LocaleValue;
  seedKeyword: string;
  onNext: () => void;
  onNewLocaleSearch: (locale: LocaleValue, keyword: string) => Promise<void>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
        copied
          ? 'border-brand-300 bg-brand-50 text-brand-700'
          : 'border-slate-300 bg-white text-slate-600 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700'
      }`}
    >
      {copied ? '✓ Kopiert' : 'Kopieren'}
    </button>
  );
}

function Section({ title, children, copyText }: { title: string; children: React.ReactNode; copyText?: string }) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-[#333333]">{title}</h3>
        {copyText && <CopyButton text={copyText} />}
      </div>
      {children}
    </div>
  );
}

function stripBlankLines(s: string): string {
  return s.replace(/\n{3,}/g, '\n\n').trim();
}

function buildPreviewHtml(wpContent: string, css: string): string {
  let html = wpContent;

  // Decode base64 vc_raw_html blocks (CSS / JS)
  html = html.replace(/\[vc_raw_html[^\]]*\]([\s\S]*?)\[\/vc_raw_html\]/g, (_, b64) => {
    try { return atob(b64.trim()); } catch { return ''; }
  });

  // vc_message → styled info box
  html = html.replace(
    /\[vc_message[^\]]*\]([\s\S]*?)\[\/vc_message\]/g,
    '<div style="background:#f0f4e8;border-left:4px solid #90ad25;padding:14px 18px;margin:20px 0;border-radius:0 6px 6px 0">$1</div>'
  );

  // vc_single_image → placeholder
  html = html.replace(
    /\[vc_single_image[^\]]*alt="([^"]*)"[^\]]*\]/g,
    '<div style="background:#f1f5f9;height:200px;display:flex;align-items:center;justify-content:center;border-radius:8px;margin:20px 0;color:#94a3b8;font-size:13px;border:2px dashed #e2e8f0">📷 $1</div>'
  );

  // MEDIAFIX-spezifische Shortcodes
  html = html.replace(/\[cgv[^\]]+\]/g, '<span style="color:#90ad25">…</span>');
  html = html.replace(/\[mf-counter[^\]]+\]/g, '10');

  // Alle verbleibenden WP-Shortcodes entfernen
  html = html.replace(/\[[^\]]+\]/g, '');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vorschau</title>
<style>
*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:860px;margin:0 auto;padding:40px 24px;color:#1e293b;line-height:1.75;font-size:16px}
h1{font-size:2rem;font-weight:800;line-height:1.2;margin:0 0 1.25rem;color:#0f172a}
h2{font-size:1.4rem;font-weight:700;margin:2.5rem 0 0.75rem;color:#1e293b;padding-top:0.5rem;border-top:1px solid #f1f5f9}
h3{font-size:1.05rem;font-weight:600;margin:1.5rem 0 0.5rem;color:#334155}
p{margin:0 0 1rem}
a{color:#90ad25}a:hover{text-decoration:underline}
a.button{display:inline-block;background:#90ad25;color:#fff!important;padding:12px 28px;border-radius:6px;font-weight:700;margin-top:12px;text-decoration:none}
table{width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:14px}
th,td{border:1px solid #e2e8f0;padding:10px 14px;text-align:left}
th{background:#f8fafc;font-weight:600}
ul,ol{padding-left:1.5rem;margin:0 0 1rem}li{margin-bottom:.35rem}
hr{border:none;border-top:2px solid #e2e8f0;margin:2rem 0}
strong{font-weight:600}
.advantages{list-style:none;padding-left:0}.advantages li::before{content:'✓ ';color:#90ad25;font-weight:700}
.disadvantages{list-style:none;padding-left:0}.disadvantages li::before{content:'✗ ';color:#ef4444;font-weight:700}
.quote-shortcode{max-width:640px;margin:2.25rem auto;text-align:center}
.quote-shortcode .quote-border{display:block;font-size:2.5rem;line-height:1;color:#90ad25;font-family:Georgia,serif}
.quote-shortcode blockquote{border:none;margin:.25rem 0;padding:0;font-size:1.15rem;font-style:italic;color:#333}
.quote-shortcode footer{margin-top:.75rem}
.quote-shortcode cite{font-style:normal;font-weight:700;color:#421e47;white-space:pre-line}
${css}
</style>
</head>
<body>${html}</body>
</html>`;
}

function openPreview(wpContent: string, css: string) {
  const html = buildPreviewHtml(wpContent, css);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

function buildVcHtml(t: SEOText): string {
  const uspsHtml = (t.usps ?? []).map((u) => `  <li>${u}</li>`).join('\n');
  const faqHtml = (t.faq ?? []).map((f) => `<strong>${f.question}</strong>\n${f.answer}`).join('\n');
  const imgs = t.images ?? [];

  const imgComment = (i: number) =>
    imgs[i]
      ? `\n<!-- BILD: ${imgs[i].description} | Alt: ${imgs[i].altText} -->\n<!-- Firefly: ${imgs[i].fireflyPrompt} -->`
      : '';

  const takeawaysHtml = (t.keyTakeaways?.length)
    ? `\n[vc_message message_box_color="grey" el_class="mf-info" css=""]<strong>Auf einen Blick</strong>\n<ul>\n${t.keyTakeaways.map((k) => `  <li>${k}</li>`).join('\n')}\n</ul>[/vc_message]`
    : '';

  const body = [
    `[vc_row][vc_column][vc_column_text css=""]`,
    `<h1>${t.h1}</h1>`,
    stripBlankLines(t.intro),
    takeawaysHtml,
    imgComment(0),
    `<h2>Unsere Stärken</h2>`,
    `<ul>\n${uspsHtml}\n</ul>`,
    imgComment(1),
    `<h2>Kosten &amp; Preise</h2>`,
    stripBlankLines(t.preise),
    `<h2>So läuft es ab</h2>`,
    stripBlankLines(t.howItWorks),
    `<h2>Hintergrund</h2>`,
    stripBlankLines(t.ursachen),
    `<h2>Häufige Fragen</h2>`,
    faqHtml,
    imgComment(2),
    stripBlankLines(t.cta),
    `<a class="button" href="https://mediafix.de/">Jetzt anfragen</a>`,
    `[/vc_column_text][/vc_column][/vc_row]`,
  ].filter(Boolean).join('\n');

  return body;
}

export default function Step5Generate({ seoText, currentLocale, seedKeyword, onNext, onNewLocaleSearch }: Props) {
  const [targetLocale, setTargetLocale] = useState<LocaleValue>(currentLocale);
  const [translatedKeyword, setTranslatedKeyword] = useState(seedKeyword);
  const [localeLoading, setLocaleLoading] = useState(false);
  const [keywordCandidates, setKeywordCandidates] = useState<{ keyword: string; searchVolume: number }[] | null>(null);
  const [keywordSuggestLoading, setKeywordSuggestLoading] = useState(false);
  const [keywordSuggestError, setKeywordSuggestError] = useState<string | null>(null);
  const isBlog = !!seoText.htmlOutput;

  const otherLocales = LOCALES.filter((l) => l.value !== currentLocale);

  function handleLocaleSelect(locale: LocaleValue) {
    setTargetLocale(locale);
    if (locale === currentLocale) setTranslatedKeyword(seedKeyword);
    setKeywordCandidates(null);
    setKeywordSuggestError(null);
  }

  async function handleSuggestKeyword() {
    setKeywordSuggestLoading(true);
    setKeywordSuggestError(null);
    setKeywordCandidates(null);
    try {
      const res = await fetch('/api/translate-keyword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedKeyword, targetLocale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKeywordCandidates(data.candidates ?? []);
    } catch (err) {
      setKeywordSuggestError(err instanceof Error ? err.message : 'Fehler beim Vorschlag');
    } finally {
      setKeywordSuggestLoading(false);
    }
  }

  async function runLocaleSearch(keyword: string) {
    if (targetLocale === currentLocale || !keyword.trim()) return;
    setLocaleLoading(true);
    await onNewLocaleSearch(targetLocale, keyword.trim());
    setLocaleLoading(false);
  }

  // Klick auf einen Vorschlag übernimmt ihn ins Feld UND startet direkt die
  // Recherche mit genau diesem Keyword — kein zweiter Klick auf "abrufen" nötig,
  // sonst bleibt die Auswahl wirkungslos, falls der zweite Klick übersehen wird.
  function handlePickCandidate(keyword: string) {
    setTranslatedKeyword(keyword);
    setKeywordCandidates(null);
    runLocaleSearch(keyword);
  }

  async function handleLocaleRerun() {
    await runLocaleSearch(translatedKeyword);
  }
  // Blog: Schema bereits server-seitig in htmlOutput enthalten
  const htmlCode = isBlog ? (seoText.htmlOutput ?? '') : buildVcHtml(seoText);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">Generierter SEO-Text</h2>
          <CopyButton text={htmlCode} />
        </div>

        {seoText.seoTitle && (
          <Section title="SEO-Title" copyText={seoText.seoTitle}>
            <p className="text-sm font-medium text-slate-800">{seoText.seoTitle}</p>
            <p className="text-xs text-slate-400 mt-1">{seoText.seoTitle.length} / 60 Zeichen</p>
          </Section>
        )}

        {seoText.seoDescription && (
          <Section title="Meta-Description" copyText={seoText.seoDescription}>
            <p className="text-sm text-[#333333]">{seoText.seoDescription}</p>
            <p className="text-xs text-slate-400 mt-1">{seoText.seoDescription.length} / 155 Zeichen</p>
          </Section>
        )}

        {seoText.urlSlug && (
          <Section title="URL-Slug" copyText={seoText.urlSlug}>
            <p className="font-mono text-sm text-brand-700">/{seoText.urlSlug}</p>
            <p className="text-xs text-slate-400 mt-1">Vor der Veröffentlichung setzen — nachträgliche Änderungen erfordern eine Weiterleitung</p>
          </Section>
        )}

        {(seoText.keyTakeaways?.length ?? 0) > 0 && (
          <Section title="Auf einen Blick (GEO)">
            <ul className="flex flex-col gap-1.5">
              {seoText.keyTakeaways!.map((k, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#333333]">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {k}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-400 mt-2">Direkt extrahierbar für AI-Snippets (ChatGPT, Perplexity, Google AI)</p>
          </Section>
        )}

        {!isBlog && (
          <>
            <Section title="H1 — Hauptüberschrift" copyText={seoText.h1}>
              <p className="text-xl font-extrabold text-slate-900">{seoText.h1}</p>
            </Section>

            <Section title="Intro" copyText={seoText.intro}>
              <p className="text-sm text-[#333333] leading-relaxed">{seoText.intro}</p>
            </Section>

            {(seoText.images?.length ?? 0) > 0 && (
              <Section title="Bildplatzhalter">
                <div className="flex flex-col gap-3">
                  {seoText.images.map((img, i) => (
                    <div key={i} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                          Bild {i + 1} — {img.position}
                        </span>
                        <CopyButton text={img.fireflyPrompt} />
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{img.description}</p>
                      <div className="rounded bg-white border border-slate-200 p-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Firefly-Prompt</p>
                        <p className="text-xs text-slate-600 font-mono">{img.fireflyPrompt}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">Alt-Text: {img.altText}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="USPs" copyText={(seoText.usps ?? []).map((u) => `• ${u}`).join('\n')}>
              <ul className="flex flex-col gap-1.5">
                {(seoText.usps ?? []).map((usp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#333333]">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-brand-100 flex items-center justify-center text-[10px] font-bold text-brand-600">
                      {i + 1}
                    </span>
                    {usp}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Preise" copyText={seoText.preise}>
              <p className="text-sm text-[#333333] leading-relaxed">{seoText.preise}</p>
            </Section>

            <Section title="Wie es funktioniert" copyText={seoText.howItWorks}>
              <p className="text-sm text-[#333333] leading-relaxed">{seoText.howItWorks}</p>
            </Section>

            <Section title="Hintergrund / Ursachen" copyText={seoText.ursachen}>
              <p className="text-sm text-[#333333] leading-relaxed">{seoText.ursachen}</p>
            </Section>

            <Section title="FAQ">
              <div className="flex flex-col gap-3">
                {(seoText.faq ?? []).map((item, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{item.question}</p>
                    <p className="text-sm text-[#333333]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Call to Action" copyText={seoText.cta}>
              <p className="text-sm text-[#333333] leading-relaxed">{seoText.cta}</p>
            </Section>
          </>
        )}

        {isBlog && (seoText.internalLinks?.length ?? 0) > 0 && (
          <Section title="Interne Verlinkungen (Vorschläge)">
            <div className="flex flex-col gap-2">
              {seoText.internalLinks!.map((link, i) => (
                <div key={i} className="rounded-lg bg-slate-50 p-2.5 text-xs">
                  <span className="font-semibold text-brand-700">{link.anchorText}</span>
                  <span className="text-slate-400 mx-1.5">→</span>
                  <span className="font-mono text-slate-600">{link.urlSuggestion}</span>
                  {link.position && <span className="ml-2 text-slate-400">({link.position})</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {isBlog && (
          <>
            <Section title="H1" copyText={seoText.h1}>
              <p className="text-xl font-extrabold text-slate-900">{seoText.h1}</p>
            </Section>

            {(seoText.images?.length ?? 0) > 0 && (
              <Section title="Bildplatzhalter">
                <div className="flex flex-col gap-3">
                  {seoText.images.map((img, i) => (
                    <div key={i} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                          Bild {i + 1} — {img.position}
                        </span>
                        <CopyButton text={img.fireflyPrompt} />
                      </div>
                      <p className="text-sm text-[#333333] mb-2">{img.description}</p>
                      <div className="rounded bg-white border border-slate-200 p-2">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Firefly-Prompt</p>
                        <p className="text-xs text-slate-600 font-mono">{img.fireflyPrompt}</p>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">Alt-Text: {img.altText}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="FAQ">
              <div className="flex flex-col gap-3">
                {(seoText.faq ?? []).map((item, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-800 mb-1">{item.question}</p>
                    <p className="text-sm text-[#333333]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}
      </div>

      {/* WordPress Quellcode */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold text-slate-900">WordPress-Quellcode</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openPreview(htmlCode, COMPONENT_CSS)}
              className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Vorschau →
            </button>
            <CopyButton text={htmlCode} />
          </div>
        </div>
        <textarea
          readOnly
          value={htmlCode}
          rows={12}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700 focus:outline-none resize-y"
        />
      </div>

      {/* WordPress CSS */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">WordPress CSS</h2>
            <p className="text-xs text-amber-600 mt-0.5 font-medium">Altes CSS im WP-Pagebuilder komplett löschen und durch dieses ersetzen — nicht ergänzen!</p>
          </div>
          <CopyButton text={COMPONENT_CSS} />
        </div>
        <textarea
          readOnly
          value={COMPONENT_CSS}
          rows={6}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700 focus:outline-none resize-y"
        />
      </div>

      {/* Locale Rerun */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Dasselbe Thema in anderer Sprache</h2>
        <p className="text-sm text-slate-500 mb-4">
          Echte lokale Keywords und SERPs für den Zielmarkt — kein automatisches Übersetzen des Artikels.
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {otherLocales.map((l) => (
            <button
              key={l.value}
              onClick={() => handleLocaleSelect(l.value)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all
                ${targetLocale === l.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:bg-brand-50'
                }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        {targetLocale !== currentLocale && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Keyword in Zielsprache
              <span className="ml-1.5 font-normal text-slate-400">
                ({LOCALES.find((l) => l.value === targetLocale)?.label})
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={translatedKeyword}
                onChange={(e) => setTranslatedKeyword(e.target.value)}
                placeholder={`z.B. "${seedKeyword}" auf Zielsprache übersetzen`}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={handleSuggestKeyword}
                disabled={keywordSuggestLoading}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-brand-200 hover:bg-brand-50 disabled:opacity-50"
              >
                {keywordSuggestLoading ? 'Suche…' : 'Vorschlag holen'}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Übersetze das Keyword in die Sprache des Zielmarkts, oder lass Claude + DataForSEO das
              such­volumenstärkste Keyword im Zielmarkt vorschlagen — eine wörtliche Übersetzung trifft nicht
              immer den echten Suchbegriff.
            </p>

            {keywordSuggestError && (
              <p className="mt-2 text-xs text-red-600">{keywordSuggestError}</p>
            )}

            {keywordCandidates && (
              keywordCandidates.length > 0 ? (
                <div className="mt-2 flex flex-col gap-1.5">
                  {keywordCandidates.map((c, i) => (
                    <button
                      key={c.keyword}
                      type="button"
                      onClick={() => handlePickCandidate(c.keyword)}
                      disabled={localeLoading}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:border-brand-300 hover:bg-brand-50 disabled:opacity-50"
                    >
                      <span className="text-slate-800">
                        {c.keyword}
                        {i === 0 && (
                          <span className="ml-2 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            Stärkstes Volumen
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {c.searchVolume.toLocaleString('de-DE')} Suchen/Monat
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">Keine Kandidaten mit Suchvolumen gefunden.</p>
              )
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleLocaleRerun}
            disabled={localeLoading || targetLocale === currentLocale || !translatedKeyword.trim()}
            className="btn-primary"
          >
            {localeLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Keywords werden abgerufen…
              </>
            ) : (
              `Keywords für ${LOCALES.find((l) => l.value === targetLocale)?.label ?? targetLocale} abrufen →`
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} className="btn-primary">
          Text überarbeiten →
        </button>
      </div>
    </div>
  );
}
