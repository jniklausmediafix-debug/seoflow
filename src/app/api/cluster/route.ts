import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { Cluster } from '@/types';
import { parseClaudeJson } from '@/lib/parseJson';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { keywords }: { keywords: string[] } = await req.json();

    if (!keywords?.length) {
      return NextResponse.json({ error: 'keywords array is required' }, { status: 400 });
    }

    const capped = keywords.slice(0, 80);

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: `Du bist ein SEO-Experte. Deine Aufgabe ist es, Keywords in semantische Themen-Cluster zu gruppieren.
Antworte AUSSCHLIESSLICH mit validem JSON, ohne Markdown-Codeblöcke oder zusätzlichen Text.`,
      messages: [
        {
          role: 'user',
          content: `Gruppiere diese ${capped.length} Keywords in 3 bis 5 semantische Cluster.
Die Cluster sollen inhaltlich klar voneinander abgrenzbar sein.

Keywords:
${capped.join('\n')}

Antworte mit diesem JSON-Schema:
{
  "clusters": [
    {
      "id": "1",
      "name": "Kurzer Cluster-Name (3-5 Wörter)",
      "description": "Ein Satz, was dieser Cluster bedeutet",
      "keywords": ["keyword1", "keyword2", ...]
    }
  ]
}`,
        },
      ],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const parsed = parseClaudeJson<{ clusters: Cluster[] }>(raw);

    return NextResponse.json({ clusters: parsed.clusters });
  } catch (err) {
    console.error('[/api/cluster]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Clustering fehlgeschlagen' },
      { status: 500 }
    );
  }
}
