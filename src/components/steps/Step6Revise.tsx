'use client';

import { useState } from 'react';
import type { SEOText } from '@/types';

interface Props {
  currentText: SEOText;
  revisedText: SEOText | null;
  revisionTranscript: string;
  onTranscript: (text: string) => void;
  onRevise: () => Promise<void>;
  onReviseAgain: () => void;
  isLoading: boolean;
  error: string | null;
}

function buildPlainText(t: SEOText): string {
  return [
    ...(t.seoTitle ? [`SEO-Title: ${t.seoTitle}`, `Meta-Description: ${t.seoDescription ?? ''}`, ''] : []),
    `# ${t.h1}`, '',
    t.intro, '',
    '## USPs', ...t.usps.map((u) => `• ${u}`), '',
    '## Preise', t.preise, '',
    '## Wie es funktioniert', t.howItWorks, '',
    '## Hintergrund', t.ursachen, '',
    '## FAQ', ...t.faq.flatMap((f) => [`**${f.question}**`, f.answer, '']),
    '## CTA', t.cta,
  ].join('\n');
}

export default function Step6Revise({
  currentText,
  revisedText,
  revisionTranscript,
  onTranscript,
  onRevise,
  onReviseAgain,
  isLoading,
  error,
}: Props) {
  const displayText = revisedText ?? currentText;
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Nachkorrektur per Sprache</h2>
        <p className="text-sm text-slate-500 mb-5">
          Sprich dein Feedback ein: Was soll geändert werden? Claude überarbeitet nur die betroffenen Abschnitte.
        </p>

        <textarea
          value={revisionTranscript}
          onChange={(e) => onTranscript(e.target.value)}
          disabled={isLoading}
          rows={4}
          placeholder={'z.B. Intro kürzer, Preise anpassen auf 80–120 €, CTA direkter formulieren… Hier kannst du auch Text aus WhisperFlow einfügen.'}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
        />

        {revisionTranscript && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => onTranscript('')}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Löschen
            </button>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={onRevise}
            disabled={isLoading || !revisionTranscript.trim()}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Claude überarbeitet…
              </>
            ) : (
              'Text überarbeiten'
            )}
          </button>

          {revisedText && (
            <button onClick={onReviseAgain} className="btn-secondary text-sm">
              Erneut überarbeiten
            </button>
          )}
        </div>
      </div>

      {revisedText && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Überarbeiteter Text</h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                Aktualisiert
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!revisedText.htmlOutput && (
                <button
                  onClick={() => setShowComparison((v) => !v)}
                  className="text-xs text-slate-400 hover:text-brand-600 transition-colors"
                >
                  {showComparison ? 'Vergleich ausblenden' : 'Vorher/Nachher'}
                </button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(revisedText.htmlOutput ?? buildPlainText(revisedText))}
                className="text-xs text-slate-400 hover:text-brand-600 transition-colors"
              >
                Kopieren
              </button>
            </div>
          </div>

          {revisedText.htmlOutput ? (
            <textarea
              readOnly
              value={revisedText.htmlOutput}
              rows={16}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700 focus:outline-none resize-y"
            />
          ) : showComparison ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Vorher</p>
                <pre className="whitespace-pre-wrap text-xs text-slate-500 bg-slate-50 p-3 rounded-lg leading-relaxed">
                  {buildPlainText(currentText)}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-500 mb-2">Nachher</p>
                <pre className="whitespace-pre-wrap text-xs text-slate-700 bg-brand-50 p-3 rounded-lg leading-relaxed">
                  {buildPlainText(revisedText)}
                </pre>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
              {buildPlainText(revisedText)}
            </pre>
          )}
        </div>
      )}

      {!revisedText && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Aktueller Text</h3>
          {currentText.htmlOutput ? (
            <textarea
              readOnly
              value={currentText.htmlOutput}
              rows={16}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-700 focus:outline-none resize-y"
            />
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-slate-600 leading-relaxed">
              {buildPlainText(currentText)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
