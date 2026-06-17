import { NextRequest, NextResponse } from 'next/server';
import type { SerpResult, LocaleValue } from '@/types';
import { LOCALE_CONFIG } from '@/types';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';

function authHeader() {
  const creds = `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`;
  return `Basic ${Buffer.from(creds).toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    const { seedKeyword, locale }: { seedKeyword: string; locale?: LocaleValue } = await req.json();
    const lc = LOCALE_CONFIG[locale ?? 'de-DE'] ?? LOCALE_CONFIG['de-DE'];
    const { locationName, languageName } = lc;

    if (!seedKeyword?.trim()) {
      return NextResponse.json({ error: 'seedKeyword is required' }, { status: 400 });
    }

    const res = await fetch(
      `${DATAFORSEO_BASE}/serp/google/organic/live/advanced`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          keyword: seedKeyword.trim(),
          location_name: locationName,
          language_name: languageName,
          device: 'desktop',
          depth: 10,
        }]),
      }
    );

    if (!res.ok) throw new Error(`DataForSEO SERP error: ${res.status}`);

    const data = await res.json();

    if (data.status_code && data.status_code !== 20000) {
      throw new Error(data.status_message ?? 'DataForSEO error');
    }

    const items: unknown[] = data?.tasks?.[0]?.result?.[0]?.items ?? [];

    const results: SerpResult[] = items
      .filter((item): item is Record<string, unknown> =>
        typeof item === 'object' && item !== null &&
        (item as Record<string, unknown>).type === 'organic'
      )
      .map((item) => ({
        position: Number(item.rank_group ?? 0),
        title: String(item.title ?? ''),
        url: String(item.url ?? ''),
        domain: String(item.domain ?? ''),
        description: String(item.description ?? ''),
      }))
      .filter((r) => r.url !== '')
      .slice(0, 10);

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[/api/serps]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'SERP-Abfrage fehlgeschlagen' },
      { status: 500 }
    );
  }
}
