import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { SEOText, LocaleValue } from '@/types';
import { LOCALE_CONFIG } from '@/types';
import { parseClaudeJson } from '@/lib/parseJson';

const client = new Anthropic();

function parseContentBlocks(raw: string, fallback: SEOText): SEOText {
  const get = (key: string) => {
    const m = raw.match(new RegExp(`###${key}###\\r?\\n([\\s\\S]*?)(?=###[A-Z_]+###|$)`));
    return m ? m[1].trim() : null;
  };

  const usps: string[] = [];
  const faq: Array<{ question: string; answer: string }> = [];
  const images = fallback.images ?? [];
  let pendingQ = '';

  const blockRegex = /###([A-Z_]+)###\r?\n([\s\S]*?)(?=###[A-Z_]+###|$)/g;
  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(raw)) !== null) {
    const [, k, v] = match;
    const val = v.trim();
    if (k === 'USP') usps.push(val);
    else if (k === 'FAQ_FRAGE') pendingQ = val;
    else if (k === 'FAQ_ANTWORT') { faq.push({ question: pendingQ, answer: val }); pendingQ = ''; }
  }

  return {
    seoTitle: fallback.seoTitle,
    seoDescription: fallback.seoDescription,
    h1: fallback.h1,
    keyTakeaways: fallback.keyTakeaways,
    images,
    intro: get('INTRO') ?? fallback.intro,
    usps: usps.length > 0 ? usps : fallback.usps,
    preise: get('PREISE') ?? fallback.preise,
    howItWorks: get('HOW') ?? fallback.howItWorks,
    ursachen: get('URSACHEN') ?? fallback.ursachen,
    faq: faq.length > 0 ? faq : fallback.faq,
    cta: get('CTA') ?? fallback.cta,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { currentText, feedback, clusterKeywords, locale }: {
      currentText: SEOText;
      feedback: string;
      clusterKeywords?: string[];
      locale?: LocaleValue;
    } = await req.json();
    const lc = LOCALE_CONFIG[locale ?? 'de-DE'] ?? LOCALE_CONFIG['de-DE'];
    const langNote = lc.contentLang !== 'Deutsch'
      ? ` Schreibe ALLE Inhalte auf ${lc.contentLang}.`
      : '';

    if (!feedback?.trim()) {
      return NextResponse.json({ error: 'feedback is required' }, { status: 400 });
    }

    const isBlog = !!currentText.htmlOutput;

    const keywordsHint = clusterKeywords?.length
      ? `\nZIEL-KEYWORDS (natuerlich beibehalten): ${clusterKeywords.slice(0, 15).join(', ')}`
      : '';

    // Blog-Post: HTML direkt ueberarbeiten
    if (isBlog) {
      const BLOG_REVISE_SYSTEM = `Du bist ein erfahrener SEO- und GEO-Texter fuer MEDIAFIX. Du ueberarbeitest WordPress Visual Composer HTML-Artikel.${langNote}

WICHTIG:
- Aendere NUR was das Feedback explizit betrifft
- Halte alle SEO-Richtlinien ein: direkte Antwort zuerst, Quellenangaben, Keywords natuerlich eingebaut
- Ausgabe: NUR den vollstaendigen ueberarbeiteten HTML-Quellcode, kein JSON, kein Markdown`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        system: BLOG_REVISE_SYSTEM,
        messages: [{
          role: 'user',
          content: `Ueberarbeite den folgenden WordPress-Artikel anhand des Feedbacks.${keywordsHint}

FEEDBACK: "${feedback}"

AKTUELLER ARTIKEL:
${currentText.htmlOutput}`,
        }],
      });

      const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
      const wpStart = raw.indexOf('[vc_row]');
      const htmlOutput = wpStart > 0 ? raw.slice(wpStart) : (raw || (currentText.htmlOutput ?? ''));

      const metaTouched = /title|description|meta|seo/i.test(feedback);
      let seoTitle = currentText.seoTitle;
      let seoDescription = currentText.seoDescription;

      if (metaTouched) {
        const metaMsg = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 256,
          system: 'Antworte NUR mit validem JSON, keine Markdown-Bloecke.',
          messages: [{
            role: 'user',
            content: `Ueberarbeite SEO-Metadaten.
Aktuell: seoTitle="${currentText.seoTitle}" | seoDescription="${currentText.seoDescription}"
Feedback: "${feedback}"
Antworte: {"seoTitle":"...","seoDescription":"..."}`,
          }],
        });
        const metaRaw = metaMsg.content[0].type === 'text' ? metaMsg.content[0].text : '';
        try {
          const meta = parseClaudeJson<{ seoTitle: string; seoDescription: string }>(metaRaw);
          seoTitle = meta.seoTitle ?? seoTitle;
          seoDescription = meta.seoDescription ?? seoDescription;
        } catch { /* keep originals */ }
      }

      return NextResponse.json({
        revisedText: { ...currentText, seoTitle, seoDescription, htmlOutput } satisfies SEOText,
      });
    }

    // Service-Seite: Delimiter-Format
    const currentSummary = [
      `INTRO: ${currentText.intro}`,
      `USPs: ${(currentText.usps ?? []).join(' | ')}`,
      `PREISE: ${currentText.preise}`,
      `HOW: ${currentText.howItWorks}`,
      `URSACHEN: ${currentText.ursachen}`,
      `FAQ: ${(currentText.faq ?? []).map((f: { question: string; answer: string }) => `Q: ${f.question} A: ${f.answer}`).join(' | ')}`,
      `CTA: ${currentText.cta}`,
    ].join('\n\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: `Du bist ein SEO-Texter.${langNote} Antworte EXAKT im ###BLOCK###-Format. Kein JSON, kein Markdown.`,
      messages: [{
        role: 'user',
        content: `Ueberarbeite den folgenden SEO-Text anhand des Feedbacks.

FEEDBACK: "${feedback}"

AKTUELLER TEXT:
${currentSummary}

Antworte im Format:
###INTRO###
[Text]

###USP###
[USP 1]
###USP###
[USP 2]
###USP###
[USP 3]
###USP###
[USP 4]
###USP###
[USP 5]

###PREISE###
[Text]

###HOW###
[Text]

###URSACHEN###
[Text]

###FAQ_FRAGE###
[Frage]
###FAQ_ANTWORT###
[Antwort]

###CTA###
[Text]`,
      }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';
    const revisedText = parseContentBlocks(raw, currentText);
    return NextResponse.json({ revisedText });

  } catch (err) {
    console.error('[/api/revise]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ueberarbeitung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
