'use client';

import { useState } from 'react';
import type { Cluster, SerpResult } from '@/types';

interface Props {
  clusters: Cluster[];
  selectedCluster: Cluster | null;
  serpResults: SerpResult[];
  onSelect: (cluster: Cluster) => void;
  onMerge: (ids: string[]) => void;
  onNext: () => void;
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export default function Step3Clusters({ clusters, selectedCluster, serpResults, onSelect, onMerge, onNext }: Props) {
  const [showSerps, setShowSerps] = useState(false);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeIds, setMergeIds] = useState<Set<string>>(new Set());

  function toggleMergeId(id: string) {
    setMergeIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleMerge() {
    if (mergeIds.size < 2) return;
    onMerge(Array.from(mergeIds));
    setMergeMode(false);
    setMergeIds(new Set());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-semibold text-slate-900">Keyword-Cluster auswählen</h2>
          <button
            onClick={() => { setMergeMode((v) => !v); setMergeIds(new Set()); }}
            className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors
              ${mergeMode
                ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
          >
            {mergeMode ? 'Abbrechen' : 'Cluster kombinieren'}
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          {mergeMode
            ? `Wähle mindestens 2 Cluster zum Kombinieren aus. (${mergeIds.size} ausgewählt)`
            : `Claude hat deine Keywords in ${clusters.length} semantische Cluster gruppiert. Wähle den Fokus für deinen Text.`
          }
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {clusters.map((cluster) => {
            const isSelected = !mergeMode && selectedCluster?.id === cluster.id;
            const isMergeSelected = mergeMode && mergeIds.has(cluster.id);
            return (
              <button
                key={cluster.id}
                onClick={() => mergeMode ? toggleMergeId(cluster.id) : onSelect(cluster)}
                className={`rounded-xl border-2 p-4 text-left transition-all hover:shadow-md
                  ${isMergeSelected
                    ? 'border-amber-400 bg-amber-50 shadow-md'
                    : isSelected
                    ? 'border-brand-500 bg-brand-50 shadow-md'
                    : 'border-slate-200 bg-white hover:border-brand-200'
                  }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={`font-semibold text-sm ${isMergeSelected ? 'text-amber-700' : isSelected ? 'text-brand-700' : 'text-slate-800'}`}>
                    {cluster.name}
                  </h3>
                  {isMergeSelected && (
                    <span className="shrink-0 rounded-full bg-amber-400 p-0.5 text-white">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  {isSelected && (
                    <span className="shrink-0 rounded-full bg-brand-500 p-0.5 text-white">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-3">{cluster.description}</p>
                <div className="flex flex-wrap gap-1">
                  {cluster.keywords.slice(0, 6).map((kw) => (
                    <span key={kw} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                      {kw}
                    </span>
                  ))}
                  {cluster.keywords.length > 6 && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400">
                      +{cluster.keywords.length - 6}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {mergeMode && mergeIds.size >= 2 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleMerge}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              {mergeIds.size} Cluster zusammenführen →
            </button>
          </div>
        )}
      </div>

      {/* SERP Panel */}
      {serpResults.length > 0 && (
        <div className="card">
          <button
            onClick={() => setShowSerps((v) => !v)}
            className="flex w-full items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Wettbewerber-SERPs</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                Top {serpResults.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="text-xs">wird an Claude übergeben</span>
              <svg
                className={`h-4 w-4 transition-transform ${showSerps ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {showSerps && (
            <div className="mt-4 flex flex-col divide-y divide-slate-100">
              {serpResults.map((r) => (
                <div key={r.url} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      {r.position}
                    </span>
                    <div className="min-w-0">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm font-semibold text-brand-700 hover:underline leading-snug mb-0.5"
                      >
                        {truncate(r.title, 70)}
                      </a>
                      <p className="text-[11px] text-emerald-700 mb-1">{truncate(r.url, 60)}</p>
                      {r.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {truncate(r.description, 160)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!selectedCluster} className="btn-primary">
          Cluster wählen &amp; weiter →
        </button>
      </div>
    </div>
  );
}
