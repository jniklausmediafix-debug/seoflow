import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { LocaleValue } from '@/types';
import { LOCALE_CONFIG } from '@/types';
import { parseClaudeJson } from '@/lib/parseJson';

const DATAFORSEO_BASE = 'https://api.dataforseo.com/v3';
const client = new Anthropic();

function authHeader() {
  const creds = `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`;
  return `Basic ${Buffer.from(creds).toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    const { seedKeyword, targetLocale }: { seedKeyword: string; targetLocale?: LocaleValue } =
      await req.json();

    if (!seedKeyword?.trim()) {
      return NextResponse.json({ error: 'seedKeyword is required' }, { status: 400 });
    }

    const lc = LOCALE_CONFIG[targetLocale ?? 'de-DE'] ?? LOCALE_CONFIG['de-DE'];
    const { locationName, languageName } = lc;

    // 1. Claude: markttypische Sucheingaben vorschlagen — keine wörtliche Übersetzung
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Das Keyword "${seedKeyword.trim()}" soll für den Suchmarkt ${locationName} (Sprache: ${languageName}) übertragen werden.

Schlage 3 Kandidaten vor, wie ${languageName}-Muttersprachler in ${locationName} das TATSÄCHLICH bei Google suchen würden — keine wörtliche Übersetzung, sondern die im Zielmarkt gebräuchliche Suchformulierung für denselben Suchintent.

Antworte NUR mit einem JSON-Array aus 3 Strings, sonst nichts (kein Markdown, keine Erklärung). Beispiel: ["scan slides", "digitize slides", "convert slides to digital"]`,
      }],
    });
    const raw = msg.content[0].type === 'text' ? msg.content[0].text : '[]';
    const candidateTerms = parseClaudeJson<string[]>(raw).filter((c) => c?.trim());

    if (!candidateTerms.length) {
      return NextResponse.json({ candidates: [] });
    }

    // 2. DataForSEO: exaktes Suchvolumen für jeden Kandidaten im Zielmarkt
    const res = await fetch(
      `${DATAFORSEO_BASE}/keywords_data/google_ads/search_volume/live`,
      {
        method: 'POST',
        headers: {
          Authorization: authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            keywords: candidateTerms,
            location_name: locationName,
            language_name: languageName,
          },
        ]),
      }
    );

    if (!res.ok) {
      throw new Error(`DataForSEO error: ${res.status}`);
    }

    const data = await res.json();
    const items: unknown[] = data?.tasks?.[0]?.result ?? [];

    const candidates = items
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((item) => ({
        keyword: String(item.keyword ?? ''),
        searchVolume: Number(item.search_volume ?? 0),
      }))
      .filter((c) => c.keyword !== '')
      .sort((a, b) => b.searchVolume - a.searchVolume);

    return NextResponse.json({ candidates });
  } catch (err) {
    console.error('[/api/translate-keyword]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unbekannter Fehler' },
      { status: 500 }
    );
  }
}
