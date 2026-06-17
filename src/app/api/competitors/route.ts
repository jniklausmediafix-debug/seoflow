import { NextRequest, NextResponse } from 'next/server';

const TIMEOUT_MS = 10000;
const MAX_CHARS = 5000;
const MAX_COMPETITORS = 5;

// Realistischer Browser-User-Agent
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, MAX_CHARS);
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return extractText(html);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { urls }: { urls: string[] } = await req.json();
    if (!urls?.length) return NextResponse.json({ competitors: [] });

    const topUrls = urls.slice(0, MAX_COMPETITORS);
    const results = await Promise.all(
      topUrls.map(async (url: string) => {
        const text = await fetchPage(url);
        return text ? { url, text } : null;
      })
    );

    const competitors = results.filter(Boolean) as Array<{ url: string; text: string }>;
    return NextResponse.json({ competitors });
  } catch (err) {
    console.error('[/api/competitors]', err);
    return NextResponse.json({ competitors: [] });
  }
}
