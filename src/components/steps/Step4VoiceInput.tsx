'use client';

import type { ContentTypeValue, SerpResult } from '@/types';

interface Props {
  contentType: ContentTypeValue;
  voiceTranscript: string;
  referenceUrl: string;
  seedKeyword: string;
  serpResults: SerpResult[];
  onContentTypeChange: (v: ContentTypeValue) => void;
  onTranscript: (text: string) => void;
  onReferenceUrlChange: (url: string) => void;
  onGenerate: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// Content-Typ-Auswahl (Dienstleistungsseite/Landing Page/Produktseite) ist aktuell ausgeblendet —
// unter der Haube laufen alle drei ohnehin durch denselben Codepfad wie contentType='blog_post'
// nicht nutzt. contentType bleibt fest auf 'blog_post' (siehe StepWizard.tsx initialState);
// Props/Pfad bleiben erhalten, um die Auswahl bei echten Typ-Profilen wieder einzublenden.
export default function Step4VoiceInput({
  voiceTranscript,
  referenceUrl,
  onTranscript,
  onReferenceUrlChange,
  onGenerate,
  isLoading,
  error,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Vorab-Input</h2>
        <p className="text-sm text-slate-500 mb-6">
          Gib optional Hinweise für Claude (Tonalität, USPs, Preisinfos, …).
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Referenz-URL <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">
              MEDIAFIX-Leistungsseite, die thematisch passt — wird als interner Link im Artikel eingebettet.
            </p>
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => onReferenceUrlChange(e.target.value)}
              disabled={isLoading}
              placeholder="z.B. https://mediafix.de/datenrettung-festplatte/"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Vorab-Hinweise für Claude <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">
              Alles was Claude ohne SERP-Daten nicht wissen kann: Fokus-Thema, spezifische Preise, Tonalität, interne Besonderheiten. Ohne Eingabe arbeitet Claude allein mit Keywords und Wettbewerbsanalyse — das reicht für die meisten Artikel.
            </p>
            <textarea
              value={voiceTranscript}
              onChange={(e) => onTranscript(e.target.value)}
              disabled={isLoading}
              rows={4}
              placeholder={'z.B. "Fokus auf externe Festplatten, nicht interne" · "Preisspanne 150–300 €" · "Ton sachlich, keine Übertreibungen" · "Unsere Stärke: Reinraum-Labor in Deutschland"'}
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
