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
      <div className="flex flex-col items-center max-w-[560px] w-full px-6 text-center">
        {/* Image with real progress bar overlaid on the baked-in static one */}
        <div className="relative w-full">
          <img
            src="/hans-guenter-loader.png"
            alt="Hans-Günter lädt"
            className="w-full select-none"
            draggable={false}
          />
          {/* Overlay: covers the static 78%-bar in the image */}
          <div
            className="absolute overflow-hidden rounded-full bg-white"
            style={{ top: '81%', left: '6.5%', width: '87%', height: '5.5%' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${pct}%`, background: '#6fbd35' }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-bold text-slate-800"
              style={{ fontSize: 'clamp(10px, 1.8vw, 16px)' }}>
              {pct}%
            </span>
          </div>
        </div>
        {/* Dynamic message — replaces the static text in the image */}
        <p className="text-base font-semibold text-slate-700 -mt-[6%] mb-[6%] px-4">
          {messages[msgIndex]}
        </p>
      </div>
    </div>
  );
}
