import { NextRequest, NextResponse } from 'next/server';
import type { Keyword, LocaleValue } from '@/types';
import { LOCALE_CONFIG } from '@/types';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';

function authHeader() {
  const creds = `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`;
  return `Basic ${Buffer.from(creds).toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    const { seedKeyword, locale }: { seedKeyword: string; locale?: LocaleValue } =
      await req.json();
    const lc = LOCALE_CONFIG[locale ?? 'de-DE'] ?? LOCALE_CONFIG['de-DE'];
    const { locationName, languageName } = lc;

    if (!seedKeyword?.trim()) {
      return NextResponse.json({ error: 'seedKeyword is required' }, { status: 400 });
    }

    const res = await fetch(
      `${DATAFORSEO_BASE}/keywords_data/google_ads/keywords_for_keywords/live`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keywords: [seedKeyword.trim()],
            location_name: locationName,
            language_name: languageName,
            limit: 60,
            order_by: ['keyword_info.search_volume,desc'],
          },
        ]),
      }
    );

    if (!res.ok) {
      throw new Error(`DataForSEO error: ${res.status}`);
    }

    const data = await res.json();
    const items: unknown[] = data?.tasks?.[0]?.result ?? [];

    const keywords: Keyword[] = items
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => ({
        keyword: String(item.keyword ?? ''),
        searchVolume: Number(item.search_volume ?? 0),
        cpc: Number(item.cpc ?? 0),
        competition: Number(item.competition_index ?? 0) / 100,
        competitionLevel: String(item.competition ?? 'UNKNOWN'),
        visible: true,
      }))
      .filter((kw) => kw.keyword !== '');

    return NextResponse.json({ keywords });
  } catch (err) {
    console.error('[/api/keywords]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
