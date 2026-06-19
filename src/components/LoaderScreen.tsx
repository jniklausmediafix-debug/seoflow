'use client';

import { useEffect, useState } from 'react';

const PHASES = {
  keywords: [
    'Hans-Günter sucht die besten Keywords für dich...',
    'Hans-Günter analysiert Suchvolumen und Konkurrenz...',
    'Hans-Günter checkt die SERP-Ergebnisse...',
    'Hans-Günter tippt fleißig Keywords in seinen Tagesplan...',
    'Hans-Günter telefoniert gerade mit DataForSEO...',
  ],
  cluster: [
    'Hans-Günter clustert deine Keywords...',
    'Hans-Günter fragt Claude um Rat...',
    'Hans-Günter gruppiert thematisch verwandte Keywords...',
    'Hans-Günter schreibt alles auf sein Whiteboard...',
  ],
  generate: [
    'Hans-Günter schreibt deinen SEO-Artikel...',
    'Hans-Günter recherchiert für maximale SERP-Power...',
    'Hans-Günter baut die interne Verlinkung ein...',
    'Hans-Günter formuliert überzeugend und keyword-optimiert...',
    'Hans-Günter prüft FAQ, Lesedauer und Bildprompts...',
    'Hans-Günter optimiert gerade alles für dich...',
    'Hans-Günter macht noch einen letzten Qualitäts-Check...',
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
    <>
      <style>{`
        @keyframes hansArms {
          0%   { transform: rotate(-1.5deg) translateY(0px); }
          20%  { transform: rotate(1deg) translateY(-5px); }
          40%  { transform: rotate(-2deg) translateY(-2px); }
          60%  { transform: rotate(1.5deg) translateY(-6px); }
          80%  { transform: rotate(-1deg) translateY(-1px); }
          100% { transform: rotate(-1.5deg) translateY(0px); }
        }
        .hans-animate {
          animation: hansArms 2.4s ease-in-out infinite;
          transform-origin: 50% 42%;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col items-center w-full px-6" style={{ maxWidth: 540 }}>

          {/* Hans-Günter mit Arm-Animation */}
          <img
            src="/hans-guenter-loader.png"
            alt="Hans-Günter lädt"
            className="hans-animate w-full select-none"
            draggable={false}
          />

          {/* Dynamische Nachricht */}
          <p className="text-lg font-semibold text-slate-800 text-center mt-4 mb-3 min-h-[1.75rem]">
            {messages[msgIndex]}
          </p>

          {/* Ladebalken — exakt so breit wie das Bild */}
          <div className="relative w-full h-9 rounded-full overflow-hidden border-[3px] border-slate-800 bg-white">
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
    </>
  );
}
