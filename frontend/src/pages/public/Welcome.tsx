import { Link, Redirect } from 'wouter';
import { Activity, FlaskConical, Home, Lock, Settings, User } from 'lucide-react';
import { Btn, Logo } from '@/components/kit';
import { useAuth } from '@/auth/AuthContext';

export default function Welcome() {
  const { session, isDemo } = useAuth();
  if (session || isDemo) return <Redirect to="/" />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-48 -top-40 size-[640px] rounded-full bg-brand-500/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-0 size-[620px] rounded-full bg-brand-300/20 blur-[130px]" />
      </div>

      <header className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav className="flex items-center gap-6 text-sm font-medium text-ink-2">
          <a href="mailto:support@prevntiv.in" className="hover:text-brand-700">Help</a>
          <a href="mailto:hello@prevntiv.in" className="hover:text-brand-700">Contact</a>
        </nav>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_1.05fr] lg:pt-0">
        <section className="animate-fade-up">
          <Logo size="lg" className="mb-6" />
          <h1 className="font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-[56px]">
            Health, without the <span className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent">heavy lifting.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg">
            The modern, ambient health ecosystem seamlessly connecting patients, proactive care professionals, modern hospitals, and rapid labs. We turn health management from a
            chore into a calm, continuous background process.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Btn size="lg" href="/role">
              Get Started
            </Btn>
            <Btn size="lg" variant="secondary" href="/role?intent=login">
              Already have an account? Log in
            </Btn>
          </div>
          <p className="mt-10 inline-flex items-center gap-2 text-[13px] text-ink-3">
            <Lock className="size-3.5" /> Secure, HIPAA-compliant ecosystem
          </p>
        </section>

        <section aria-hidden className="relative animate-fade-up [animation-delay:120ms]">
          <div className="rounded-[32px] border border-white bg-white/50 p-3 shadow-[0_40px_80px_-30px_rgb(1_92_61/0.3)] backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-[24px] border border-line-soft bg-gradient-to-br from-white to-slate-50 px-6 pb-10 pt-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-bold text-ink-2">
                  Prev<span className="text-brand-500">ntiv</span>
                </span>
                <div className="flex gap-2 text-ink-4">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Home className="size-3.5" /></span>
                  <span className="inline-flex size-7 items-center justify-center rounded-full"><User className="size-3.5" /></span>
                  <span className="inline-flex size-7 items-center justify-center rounded-full"><Settings className="size-3.5" /></span>
                </div>
              </div>
              <div className="relative mx-auto mt-6 h-56 max-w-md">
                {/* ambient orbs */}
                {[
                  ['left-[22%] top-[18%] size-16', 'from-white to-slate-200'],
                  ['left-[48%] top-[5%] size-20', 'from-brand-100 to-brand-300'],
                  ['right-[12%] top-[30%] size-24', 'from-slate-100 to-slate-300'],
                  ['left-[8%] top-[52%] size-12', 'from-white to-brand-100'],
                  ['left-[40%] top-[48%] size-28', 'from-brand-50 to-brand-200'],
                ].map(([pos, grad], i) => (
                  <span key={i} className={`absolute rounded-full bg-gradient-to-br ${grad} ${pos} shadow-[inset_-8px_-10px_20px_rgb(255_255_255/0.8),0_18px_30px_-12px_rgb(15_23_42/0.25)] animate-[pulse_6s_ease-in-out_infinite]`} style={{ animationDelay: `${i * 0.6}s` }} />
                ))}
                <div className="absolute left-[18%] top-[22%] flex items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-lift">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-700 text-white"><Activity className="size-4" /></span>
                  <span className="text-left">
                    <span className="block text-[11px] text-ink-3">Vitals Sync</span>
                    <span className="block text-sm font-bold text-ink">Optimal</span>
                  </span>
                </div>
                <div className="absolute bottom-[4%] right-[6%] flex items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-lift">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-100 text-brand-700"><FlaskConical className="size-4" /></span>
                  <span className="text-left">
                    <span className="block text-[11px] text-ink-3">Lab Results</span>
                    <span className="block text-sm font-bold text-ink">Ready</span>
                  </span>
                </div>
              </div>
              <p className="mt-2 text-center font-display text-2xl font-semibold text-ink-2">
                Welcome to <span className="text-brand-400">Prevntiv</span>
              </p>
              <p className="mt-1 text-center text-xs text-ink-3">Your proactive path to wellness begins here.</p>
            </div>
          </div>
        </section>
      </main>
      <p className="sr-only">
        <Link href="/role">Choose your role</Link>
      </p>
    </div>
  );
}
