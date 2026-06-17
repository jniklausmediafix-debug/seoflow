'use client';

import { CONTENT_TYPES, type ContentTypeValue, type SerpResult } from '@/types';

interface Props {
  contentType: ContentTypeValue;
  voiceTranscript: string;
  seedKeyword: string;
  serpResults: SerpResult[];
  onContentTypeChange: (v: ContentTypeValue) => void;
  onTranscript: (text: string) => void;
  onGenerate: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

function recommendContentType(seedKeyword: string, serpResults: SerpResult[]): ContentTypeValue {
  const kw = seedKeyword.toLowerCase();

  const infoPatterns = /\bwie\b|anleitung|ratgeber|tipps?|guide|erkl|versteh|was ist|was sind|warum|unterschied|vergleich/i;
  const servicePatterns = /kosten|preis|service|reparatur|reinigung|montage|installation|beauftrag|angebot|auftrag/i;
  const productPatterns = /kaufen|bestellen|shop|produkt|modell|test|vergleich.*kauf/i;

  const infoSerpCount = serpResults.filter(r =>
    /ratgeber|guide|anleitung|tipps|erkl|versteh|was ist|how to|\d+\s*(wege|tipps|methoden|gründe)/i.test(r.title)
  ).length;

  const serviceSerpCount = serpResults.filter(r =>
    /service|reparatur|kosten|preis|beauftrag|angebot|firma|fachbetrieb/i.test(r.title)
  ).length;

  if (productPatterns.test(kw)) return 'product_page';
  if (infoPatterns.test(kw) || infoSerpCount >= 3) return 'blog_post';
  if (servicePatterns.test(kw) || serviceSerpCount >= 3) return 'service_page';
  if (infoSerpCount > serviceSerpCount) return 'blog_post';
  return 'service_page';
}

export default function Step4VoiceInput({
  contentType,
  voiceTranscript,
  seedKeyword,
  serpResults,
  onContentTypeChange,
  onTranscript,
  onGenerate,
  isLoading,
  error,
}: Props) {
  const recommended = recommendContentType(seedKeyword, serpResults);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Content-Typ &amp; Vorab-Input</h2>
        <p className="text-sm text-slate-500 mb-6">
          Wähle den Seitentyp und gib optional Hinweise für Claude (Tonalität, USPs, Preisinfos, …).
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Content-Typ</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONTENT_TYPES.map((ct) => {
              const isSelected = contentType === ct.value;
              const isRecommended = ct.value === recommended;
              return (
                <button
                  key={ct.value}
                  onClick={() => onContentTypeChange(ct.value)}
                  className={`relative rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all text-left
                    ${isSelected
                      ? 'border-brand-500 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:border-brand-200'
                    }`}
                >
                  {isRecommended && (
                    <span className="absolute -top-2 left-2 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white leading-tight">
                      Empfohlen
                    </span>
                  )}
                  {ct.label}
                </button>
              );
            })}
          </div>
          {recommended && (
            <p className="mt-2 text-xs text-slate-400">
              Empfehlung basiert auf Keyword-Analyse und SERP-Auswertung.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Vorab-Hinweise für Claude <span className="font-normal text-slate-400">(optional)</span>
          </label>

          <textarea
            value={voiceTranscript}
            onChange={(e) => onTranscript(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder="z.B. Tonalität, USPs, Preisinfos, Besonderheiten des Betriebs… Hier kannst du auch Text aus WhisperFlow einfügen."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
          />

          {voiceTranscript && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => onTranscript('')}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Löschen
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end">
        <button onClick={onGenerate} disabled={isLoading} className="btn-primary">
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Claude generiert SEO-Text…
            </>
          ) : (
            'SEO-Text generieren →'
          )}
        </button>
      </div>
    </div>
  );
}
