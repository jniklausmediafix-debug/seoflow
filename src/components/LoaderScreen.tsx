'use client';

import { useEffect, useState } from 'react';

const PHASES = {
  keywords: [
    'Hans-Günter sucht die besten Keywords für dich...',
    'Hans-Günter analysiert Suchvolumen und Konkurrenz...',
    'Hans-Günter checkt die SERP-Ergebnisse...',
    'Hans-Günter telefoniert gerade mit DataForSEO...',
    'Hans-Günter tippt fleißig Keywords in seinen Tagesplan...',
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
      const t = setTimeout(() => { setVisible(false); setProgress(0); }, 500);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!visible || !isLoading) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p < 35) return p + 2.5;
        if (p < 65) return p + 1.0;
        if (p < 82) return p + 0.4;
        if (p < 94) return p + 0.1;
        return p;
      });
    }, 200);
    return () => clearInterval(id);
  }, [visible, isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const msgs = PHASES[phase];
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % msgs.length), 3500);
    return () => clearInterval(id);
  }, [isLoading, phase]);

  if (!visible) return null;

  const pct = Math.round(Math.min(progress, 100));
  const msg = PHASES[phase][msgIndex];

  return (
    <>
      <style>{`
        @keyframes armKaffee {
          0%, 100% { transform: rotate(0deg); }
          40%       { transform: rotate(-10deg); }
          70%       { transform: rotate(-4deg); }
        }
        @keyframes armClipboard {
          0%, 100% { transform: rotate(0deg); }
          50%       { transform: rotate(9deg); }
        }
        @keyframes armDaumen {
          0%, 100% { transform: rotate(0deg) translateY(0px); }
          50%       { transform: rotate(-8deg) translateY(-8px); }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col items-center w-full px-6" style={{ maxWidth: 560 }}>

          {/* Layer-Stack: Body + je ein Arm-Bild */}
          <div className="relative w-full">
            {/* Basis-Body */}
            <img
              src="/hans-body.png"
              alt="Hans-Günter"
              className="w-full block select-none"
              draggable={false}
            />

            {/* Arm: Kaffee – rotiert um linke Schulter */}
            <img
              src="/hans-arm-kaffee.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full select-none pointer-events-none"
              draggable={false}
              style={{
                transformOrigin: '37% 54%',
                animation: 'armKaffee 1.6s ease-in-out infinite',
              }}
            />

            {/* Arm: Klemmbrett – rotiert um rechte Schulter */}
            <img
              src="/hans-arm-clipboard.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full select-none pointer-events-none"
              draggable={false}
              style={{
                transformOrigin: '63% 48%',
                animation: 'armClipboard 1.4s ease-in-out infinite',
              }}
            />

            {/* Arm: Daumen hoch – separate Bewegung */}
            <img
              src="/hans-arm-daumen.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full select-none pointer-events-none"
              draggable={false}
              style={{
                transformOrigin: '64% 50%',
                animation: 'armDaumen 1.2s ease-in-out infinite',
              }}
            />
          </div>

          {/* Dynamische Nachricht */}
          <p className="text-lg font-semibold text-slate-800 text-center mt-4 mb-3 min-h-[1.75rem]">
            {msg}
          </p>

          {/* Ladebalken */}
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
