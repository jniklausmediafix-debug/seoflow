import StepWizard from '@/components/StepWizard';

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-lg">
            S
          </div>
          <span className="text-xl font-bold text-slate-900">SEOFlow</span>
          <span className="ml-2 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-600">
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
