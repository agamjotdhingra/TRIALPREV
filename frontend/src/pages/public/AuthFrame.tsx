import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/kit';
import { cn } from '@/lib/utils';

/** Minimal transactional frame used by sign-in, verification and onboarding flows (nav suppressed). */
export function AuthFrame({ children, back, right, className, footer = true }: { children: ReactNode; back?: { href: string; label: string }; right?: ReactNode; className?: string; footer?: boolean }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-24 size-[520px] rounded-full bg-brand-400/15 blur-[110px]" />
        <div className="absolute -right-32 -top-24 size-[420px] rounded-full bg-brand-300/20 blur-[100px]" />
        <div className="absolute -bottom-40 right-10 size-[480px] rounded-full bg-brand-500/10 blur-[120px]" />
      </div>
      <header className="relative z-10 flex h-16 items-center justify-between px-5 sm:px-8">
        {back ? (
          <Link href={back.href} className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-2 transition-colors hover:text-brand-700">
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
        ) : (
          <Link href="/welcome" aria-label="Prevntiv home">
            <Logo />
          </Link>
        )}
        {right ?? (back ? <Logo size="sm" /> : null)}
      </header>
      <main className={cn('relative z-10 flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center sm:pt-0', className)}>{children}</main>
      {footer && (
        <footer className="relative z-10 flex flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-ink-3 sm:flex-row sm:px-8">
          <span>© 2026 Prevntiv Health Ecosystem. All rights reserved.</span>
          <nav className="flex gap-5">
            {['Privacy', 'Terms', 'Support', 'Security'].map((l) => (
              <a key={l} href="#" onClick={(e) => e.preventDefault()} className="hover:text-brand-700">
                {l}
              </a>
            ))}
          </nav>
        </footer>
      )}
    </div>
  );
}

export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('w-full rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-24px_rgb(1_92_61/0.25)] backdrop-blur-xl sm:p-10 animate-fade-up', className)}>{children}</div>;
}
