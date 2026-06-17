'use client';

import { useState, useRef, useCallback } from 'react';

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  locale?: string;
}

type RecordingState = 'idle' | 'recording' | 'transcribing';

export default function AudioRecorder({ onTranscript, disabled = false, locale }: Props) {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribe(blob, mimeType);
      };

      recorder.start(250);
      setState('recording');

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      setError('Mikrofon-Zugriff verweigert. Bitte Berechtigung erteilen.');
      setState('idle');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setState('transcribing');
    mediaRecorderRef.current?.stop();
  }, []);

  const transcribe = async (blob: Blob, mimeType: string) => {
    try {
      const formData = new FormData();
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      formData.append('audio', blob, `recording.${ext}`);
      if (locale) formData.append('locale', locale);

      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      onTranscript(data.transcript ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transkription fehlgeschlagen');
    } finally {
      setState('idle');
    }
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {state === 'idle' && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="btn-secondary gap-2"
          >
            <span className="h-3 w-3 rounded-full bg-red-500" />
            Aufnahme starten
          </button>
        )}

        {state === 'recording' && (
          <button onClick={stopRecording} className="btn-primary gap-2 bg-red-600 hover:bg-red-700">
            <span className="h-3 w-3 animate-pulse rounded-full bg-white" />
            Stopp ({fmt(duration)})
          </button>
        )}

        {state === 'transcribing' && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Wird transkribiert…
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
