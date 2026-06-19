'use client';

import type { Keyword } from '@/types';

interface Props {
  keywords: Keyword[];
  onToggle: (keyword: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onCluster: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  seedKeyword: string;
}

const COMPETITION_COLORS: Record<string, string> = {
  LOW: 'bg-emerald-100 text-emerald-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
  UNKNOWN: 'bg-slate-100 text-slate-600',
};

function fmtVolume(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

export default function Step2KeywordChips({
  keywords,
  onToggle,
  onSelectAll,
  onSelectNone,
  onCluster,
  isLoading,
  error,
  seedKeyword,
}: Props) {
  const visible = keywords.filter((k) => k.visible);
  const hidden = keywords.filter((k) => !k.visible);

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-semibold text-slate-900">Keywords filtern</h2>
          <span className="text-sm text-slate-500">
            {visible.length} aktiv · {hidden.length} ausgeblendet
          </span>
        </div>
        <p className="text-sm text-slate-500 mb-3">
          Klicke auf irrelevante Keywords, um sie auszublenden. Die verbleibenden {visible.length} Keywords werden geclustert.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={onSelectAll}
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Alle auswählen
          </button>
          <button
            onClick={onSelectNone}
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Alle abwählen
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <button
              key={kw.keyword}
              onClick={() => onToggle(kw.keyword)}
              className={`group flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all
                ${kw.visible
                  ? 'border-brand-200 bg-brand-50 text-brand-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700'
                  : 'border-slate-200 bg-slate-100 text-slate-400 line-through hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 hover:no-underline'
                }`}
            >
              <span>{kw.keyword}</span>
              {kw.visible && kw.searchVolume > 0 && (
                <span className="text-xs text-slate-400 group-hover:text-red-400">
                  {fmtVolume(kw.searchVolume)}
                </span>
              )}
              {kw.visible && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${COMPETITION_COLORS[kw.competitionLevel] ?? COMPETITION_COLORS.UNKNOWN}`}
                >
                  {kw.competitionLevel.charAt(0)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Legende */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Legende:</span>
          <span>
            <span className="font-medium text-slate-700">123K</span> = monatl. Suchvolumen
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">L</span>
            geringe Konkurrenz
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-800">M</span>
            mittlere Konkurrenz
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">H</span>
            hohe Konkurrenz
          </span>
          <span className="flex items-center gap-1">
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">U</span>
            Konkurrenz unbekannt
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onCluster}
          disabled={isLoading || visible.length < 3}
          className="btn-primary"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Claude clustert…
            </>
          ) : (
            `${visible.length} Keywords clustern →`
          )}
        </button>
      </div>
    </div>
  );
}
