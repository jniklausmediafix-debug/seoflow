'use client';

import { useState, useCallback } from 'react';
import type { WizardState, Keyword, Cluster, ContentTypeValue, SerpResult, LocaleValue } from '@/types';
import Step1Keywords from './steps/Step1Keywords';
import Step2KeywordChips from './steps/Step2KeywordChips';
import Step3Clusters from './steps/Step3Clusters';
import Step4VoiceInput from './steps/Step4VoiceInput';
import Step5Generate from './steps/Step5Generate';
import Step6Revise from './steps/Step6Revise';

const STEP_LABELS = [
  'Keyword-Input',
  'Keywords filtern',
  'Cluster wählen',
  'Vorab-Input',
  'Text generieren',
  'Nachkorrektur',
];

const initialState: WizardState = {
  step: 1,
  locale: 'de-DE',
  seedKeyword: '',
  keywords: [],
  serpResults: [],
  competitorContent: [],
  clusters: [],
  selectedCluster: null,
  contentType: 'blog_post',
  voiceTranscript: '',
  referenceUrl: '',
  generatedText: null,
  revisionTranscript: '',
  revisedText: null,
  isLoading: false,
  error: null,
};

export default function StepWizard() {
  const [state, setState] = useState<WizardState>(initialState);

  const set = useCallback((patch: Partial<WizardState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  // ── Phase 1 → 2: Keyword-Recherche + SERP parallel ─────────────────────
  const handleSearch = async (seedKeyword: string) => {
    set({ isLoading: true, error: null, seedKeyword });
    try {
      const body = JSON.stringify({ seedKeyword, locale: state.locale });
      const headers = { 'Content-Type': 'application/json' };
      const [kwRes, serpRes] = await Promise.all([
        fetch('/api/keywords', { method: 'POST', headers, body }),
        fetch('/api/serps', { method: 'POST', headers, body }),
      ]);
      const kwData = await kwRes.json();
      if (!kwRes.ok) throw new Error(kwData.error);
      const serpData = serpRes.ok ? await serpRes.json() : { results: [] };
      const serpResults: SerpResult[] = serpData.results ?? [];

      // Competitor content fetched in background (non-blocking)
      const compUrls = serpResults.slice(0, 3).map((r: SerpResult) => r.url);
      const compPromise = compUrls.length
        ? fetch('/api/competitors', {
            method: 'POST', headers,
            body: JSON.stringify({ urls: compUrls }),
          }).then(r => r.json()).catch(() => ({ competitors: [] }))
        : Promise.resolve({ competitors: [] });

      const compData = await compPromise;
      set({
        keywords: kwData.keywords as Keyword[],
        serpResults,
        competitorContent: compData.competitors ?? [],
        step: 2,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler', isLoading: false });
    }
  };

  // ── Phase 2: Keyword-Chip toggle ─────────────────────────────────────────
  const handleToggleKeyword = (keyword: string) => {
    set({
      keywords: state.keywords.map((k) =>
        k.keyword === keyword ? { ...k, visible: !k.visible } : k
      ),
    });
  };

  const handleSelectAllKeywords = () => {
    set({ keywords: state.keywords.map((k) => ({ ...k, visible: true })) });
  };

  const handleSelectNoneKeywords = () => {
    set({ keywords: state.keywords.map((k) => ({ ...k, visible: false })) });
  };

  // ── Phase 2 → 3: Clustering ──────────────────────────────────────────────
  const handleCluster = async () => {
    const visibleKeywords = state.keywords
      .filter((k) => k.visible)
      .map((k) => k.keyword);
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: visibleKeywords }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set({ clusters: data.clusters as Cluster[], step: 3, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler', isLoading: false });
    }
  };

  // ── Phase 3: Cluster auswählen ───────────────────────────────────────────
  const handleSelectCluster = (cluster: Cluster) => {
    set({ selectedCluster: cluster });
  };

  const handleMergeClusters = (ids: string[]) => {
    const toMerge = state.clusters.filter((c) => ids.includes(c.id));
    const merged: Cluster = {
      id: 'merged-' + Date.now(),
      name: toMerge.map((c) => c.name).join(' + '),
      description: `Kombiniert aus: ${toMerge.map((c) => c.name).join(', ')}`,
      keywords: Array.from(new Set(toMerge.flatMap((c) => c.keywords))),
    };
    const remaining = state.clusters.filter((c) => !ids.includes(c.id));
    set({ clusters: [...remaining, merged], selectedCluster: merged });
  };

  const handleClusterNext = () => {
    if (state.selectedCluster) set({ step: 4, error: null });
  };

  // ── Phase 4 → 5: Text generieren ─────────────────────────────────────────
  const handleGenerate = async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cluster: state.selectedCluster,
          contentType: state.contentType,
          voiceTranscript: state.voiceTranscript,
          referenceUrl: state.referenceUrl || undefined,
          seedKeyword: state.seedKeyword,
          serpResults: state.serpResults.slice(0, 5),
          competitorContent: state.competitorContent,
          locale: state.locale,
          ...(state.preservedImages?.length ? { existingImages: state.preservedImages } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set({ generatedText: data.seoText, step: 5, isLoading: false, preservedImages: undefined });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler', isLoading: false });
    }
  };

  // ── Phase 5: Dasselbe Thema in anderer Sprache ───────────────────────────
  const handleNewLocaleSearch = async (newLocale: LocaleValue, keyword: string) => {
    set({ isLoading: true, error: null, locale: newLocale, seedKeyword: keyword,
          clusters: [], selectedCluster: null, generatedText: null, revisedText: null });
    try {
      const body = JSON.stringify({ seedKeyword: keyword, locale: newLocale });
      const headers = { 'Content-Type': 'application/json' };
      const [kwRes, serpRes] = await Promise.all([
        fetch('/api/keywords', { method: 'POST', headers, body }),
        fetch('/api/serps', { method: 'POST', headers, body }),
      ]);
      const kwData = await kwRes.json();
      if (!kwRes.ok) throw new Error(kwData.error);
      const serpData = serpRes.ok ? await serpRes.json() : { results: [] };
      const serpResults: SerpResult[] = serpData.results ?? [];

      const compUrls = serpResults.slice(0, 3).map((r: SerpResult) => r.url);
      const compData = compUrls.length
        ? await fetch('/api/competitors', { method: 'POST', headers, body: JSON.stringify({ urls: compUrls }) })
            .then(r => r.json()).catch(() => ({ competitors: [] }))
        : { competitors: [] };

      set({ keywords: kwData.keywords as Keyword[], serpResults,
            competitorContent: compData.competitors ?? [], step: 2, isLoading: false,
            preservedImages: state.generatedText?.images ?? [] });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler', isLoading: false });
    }
  };

  // ── Phase 5 → 6 ──────────────────────────────────────────────────────────
  const handleGoToRevise = () => set({ step: 6, error: null });

  // ── Phase 6: Text überarbeiten ───────────────────────────────────────────
  const handleRevise = async () => {
    if (!state.revisionTranscript.trim() || !state.generatedText) return;
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentText: state.revisedText ?? state.generatedText,
          feedback: state.revisionTranscript,
          clusterKeywords: state.selectedCluster?.keywords ?? [],
          locale: state.locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set({ revisedText: data.revisedText, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Fehler', isLoading: false });
    }
  };

  const handleReviseAgain = () => {
    set({ revisionTranscript: '', error: null });
  };

  const handleBack = () => {
    if (state.step > 1) set({ step: state.step - 1, error: null });
  };

  // ── Step-Indicator ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8">
      {/* Step Indicator */}
      <nav aria-label="Fortschritt">
        <ol className="flex items-center gap-0">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < state.step;
            const isActive = stepNum === state.step;
            const isLast = i === STEP_LABELS.length - 1;

            return (
              <li key={stepNum} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => isDone && set({ step: stepNum, error: null })}
                    disabled={!isDone}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all
                      ${isDone ? 'bg-brand-600 text-white cursor-pointer hover:bg-brand-700'
                        : isActive ? 'bg-brand-600 text-white ring-4 ring-brand-100 cursor-default'
                        : 'bg-slate-100 text-slate-400 cursor-default'}`}
                  >
                    {isDone ? (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </button>
                  <span
                    className={`hidden text-[11px] font-medium sm:block ${
                      isActive ? 'text-brand-600' : isDone ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={`h-0.5 flex-1 mx-1 transition-all ${
                      isDone ? 'bg-brand-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      {state.step === 1 && (
        <Step1Keywords
          onSearch={handleSearch}
          isLoading={state.isLoading}
          error={state.error}
          locale={state.locale}
          onLocaleChange={(v: LocaleValue) => set({ locale: v })}
        />
      )}

      {state.step === 2 && (
        <Step2KeywordChips
          keywords={state.keywords}
          onToggle={handleToggleKeyword}
          onSelectAll={handleSelectAllKeywords}
          onSelectNone={handleSelectNoneKeywords}
          onCluster={handleCluster}
          isLoading={state.isLoading}
          error={state.error}
          seedKeyword={state.seedKeyword}
        />
      )}

      {state.step === 3 && (
        <Step3Clusters
          clusters={state.clusters}
          selectedCluster={state.selectedCluster}
          serpResults={state.serpResults}
          onSelect={handleSelectCluster}
          onMerge={handleMergeClusters}
          onNext={handleClusterNext}
        />
      )}

      {state.step === 4 && (
        <Step4VoiceInput
          contentType={state.contentType}
          voiceTranscript={state.voiceTranscript}
          referenceUrl={state.referenceUrl}
          seedKeyword={state.seedKeyword}
          serpResults={state.serpResults}
          onContentTypeChange={(v: ContentTypeValue) => set({ contentType: v })}
          onTranscript={(t) => set({ voiceTranscript: t })}
          onReferenceUrlChange={(u) => set({ referenceUrl: u })}
          onGenerate={handleGenerate}
          isLoading={state.isLoading}
          error={state.error}
        />
      )}

      {state.step === 5 && state.generatedText && (
        <Step5Generate
          seoText={state.generatedText}
          currentLocale={state.locale}
          seedKeyword={state.seedKeyword}
          onNext={handleGoToRevise}
          onNewLocaleSearch={handleNewLocaleSearch}
        />
      )}

      {state.step === 6 && state.generatedText && (
        <Step6Revise
          currentText={state.generatedText}
          revisedText={state.revisedText}
          revisionTranscript={state.revisionTranscript}
          onTranscript={(t) => set({ revisionTranscript: t })}
          onRevise={handleRevise}
          onReviseAgain={handleReviseAgain}
          isLoading={state.isLoading}
          error={state.error}
        />
      )}

      {/* Navigation Buttons */}
      {state.step > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={handleBack}
            disabled={state.isLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
          <button
            onClick={() => setState(initialState)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Von vorne beginnen
          </button>
        </div>
      )}
    </div>
  );
}
