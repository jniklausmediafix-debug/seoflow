'use client';

import { useState } from 'react';
import { LOCALES, type LocaleValue } from '@/types';

interface Props {
  onSearch: (seedKeyword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  locale: LocaleValue;
  onLocaleChange: (v: LocaleValue) => void;
}

export default function Step1Keywords({ onSearch, isLoading, error, locale, onLocaleChange }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <div className="card max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Keyword-Recherche starten</h2>
      <p className="text-sm text-slate-500 mb-6">
        Gib ein Thema oder Seed-Keyword ein. DataForSEO recherchiert verwandte Keywords mit Suchvolumen und CPC.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Markt &amp; Sprache
          </label>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => onLocaleChange(l.value)}
                disabled={isLoading}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-all
                  ${locale === l.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 text-slate-600 hover:border-brand-200 bg-white'
                  } disabled:opacity-40`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="seed" className="block text-sm font-medium text-slate-700 mb-1.5">
            Seed-Keyword / Thema
          </label>
          <input
            id="seed"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="z.B. Festplatte Datenrettung, VHS digitalisieren Kosten, …"
            className="input-field"
            disabled={isLoading}
            autoFocus
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary self-start" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Keywords werden geladen…
            </>
          ) : (
            'Keywords recherchieren'
          )}
        </button>
      </form>
    </div>
  );
}
