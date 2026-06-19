'use client';

import { useEffect, useState } from 'react';

const PHASES = {
  keywords: [
    'Hans-Günter fragt DataForSEO nach den besten Keywords...',
    'Hans-Günter analysiert das Suchvolumen...',
    'Hans-Günter sortiert die Konkurrenz aus...',
    'Hans-Günter prüft noch schnell die SERP-Ergebnisse...',
    'Hans-Günter tippt fleißig Keywords in seinen Tagesplan...',
  ],
  cluster: [
    'Hans-Günter clustert deine Keywords mit voller Power...',
    'Hans-Günter fragt Claude um Rat...',
    'Hans-Günter gruppiert thematisch verwandte Keywords...',
    'Hans-Günter schreibt alles auf sein Whiteboard...',
  ],
  generate: [
    'Hans-Günter schreibt deinen SEO-Artikel...',
    'Hans-Günter recherchiert für maximale SERP-Power...',
    'Hans-Günter baut die interne Verlinkung ein...',
    'Hans-Günter formuliert überzeugend und keyword-optimiert...',
    'Hans-Günter prüft Lesedauer, FAQ und Bildprompts...',
    'Hans-Günter macht noch einen letzten Qualitäts-Check...',
    'Hans-Günter optimiert gerade alles für dich...',
  ],
};

interface Props {
  isLoading: boolean;
  phase?: keyof typeof PHASES;
}

export default function LoaderScreen({ isLoading, phase = 'generate' }: Props) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      setMsgIndex(0);
      setVisible(true);
    } else if (visible) {
      setProgress(100);
      const t = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!visible || !isLoading) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) return prev + 2.5;
        if (prev < 65) return prev + 1.0;
        if (prev < 82) return prev + 0.4;
        if (prev < 94) return prev + 0.1;
        return prev;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [visible, isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const messages = PHASES[phase];
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isLoading, phase]);

  if (!visible) return null;

  const messages = PHASES[phase];
  const pct = Math.round(Math.min(progress, 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 max-w-xl w-full px-6 text-center">
        <img
          src="/hans-guenter-loader.png"
          alt="Hans-Günter lädt"
          className="w-full max-w-[520px] select-none"
          draggable={false}
        />
        <p className="text-xl font-semibold text-slate-800 min-h-[2rem] transition-all">
          {messages[msgIndex]}
        </p>
        <div className="relative w-full max-w-[520px] h-9 rounded-full overflow-hidden border-[3px] border-slate-800 bg-white">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%`, background: '#6fbd35' }}
          />
          <span className="absolute inset-0 flex items-center justify-center font-bold text-slate-800 text-sm">
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}
