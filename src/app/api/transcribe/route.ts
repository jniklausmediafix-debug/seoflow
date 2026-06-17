import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { toFile } from 'openai/uploads';
import type { LocaleValue } from '@/types';
import { LOCALE_CONFIG } from '@/types';

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob | null;
    const locale = formData.get('locale') as LocaleValue | null;
    const whisperLang = LOCALE_CONFIG[locale ?? 'de-DE']?.whisperLang ?? 'de';

    if (!audioBlob) {
      return NextResponse.json({ error: 'audio file is required' }, { status: 400 });
    }

    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    const file = await toFile(buffer, 'recording.webm', { type: audioBlob.type || 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: whisperLang,
    });

    return NextResponse.json({ transcript: transcription.text });
  } catch (err) {
    console.error('[/api/transcribe]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Transkription fehlgeschlagen' },
      { status: 500 }
    );
  }
}
