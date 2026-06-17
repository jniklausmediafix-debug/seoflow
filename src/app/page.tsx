import StepWizard from '@/components/StepWizard';

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="h-7 w-1.5 rounded-full bg-brand-500" />
            <div className="h-5 w-1.5 rounded-full bg-mf-orange" />
            <div className="h-3 w-1.5 rounded-full bg-mf-red" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-wide text-slate-900">MEDIAFIX</span>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-lg font-semibold text-brand-500">SEOFLOW</span>
          </div>
          <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600 border border-brand-100">
            Beta
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <StepWizard />
      </div>
    </main>
  );
}
