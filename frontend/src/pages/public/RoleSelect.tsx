import { Link, useLocation, useSearch } from 'wouter';
import { ArrowRight, Building2, FlaskConical, HeartPulse, Shield, Stethoscope, User, Sparkles } from 'lucide-react';
import { AuthFrame } from './AuthFrame';
import { useAuth, type UserRole } from '@/auth/AuthContext';
import { cn } from '@/lib/utils';

const ROLES = [
  { key: 'patient', title: 'Patient Portal', desc: 'Access your personal health records, test results, and communicate securely with your providers.', cta: 'Access Portal', href: '/auth/phone', icon: User, accent: true },
  { key: 'doctor', title: 'Professionals', desc: 'Manage patient care, review clinical data, issue e-prescriptions and coordinate with care teams.', cta: 'Provider Login', href: '/auth/login?role=doctor', icon: Stethoscope },
  { key: 'hospital', title: 'Hospital Admin', desc: 'Oversee facility operations, manage staff access, and monitor compliance metrics.', cta: 'Admin Access', href: '/auth/login?role=hospital', icon: Building2 },
  { key: 'lab', title: 'Lab', desc: 'Process orders, upload diagnostic results, and manage lab facility integrations.', cta: 'Lab Portal', href: '/auth/login?role=lab', icon: FlaskConical },
  { key: 'therapy', title: 'Physiotherapist & Nutritionist', desc: 'Mobility rehabilitation, exercise plans, and personalized dietary care.', cta: 'Specialist Login', href: '/auth/login?role=doctor', icon: HeartPulse },
];

const DEMOS: { role: UserRole; label: string; home: string }[] = [
  { role: 'patient', label: 'Patient', home: '/patient/dashboard' },
  { role: 'doctor', label: 'Doctor', home: '/doctor/dashboard' },
  { role: 'hospital_admin', label: 'Hospital Admin', home: '/hospital/dashboard' },
  { role: 'lab_admin', label: 'Lab Admin', home: '/lab/dashboard' },
  { role: 'platform_admin', label: 'Platform Admin', home: '/admin/dashboard' },
];

export default function RoleSelect() {
  const { enterDemo } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const loginIntent = new URLSearchParams(search).get('intent') === 'login';

  return (
    <AuthFrame back={{ href: '/welcome', label: loginIntent ? 'Back' : 'Back to Sign In' }}>
      <div className="w-full max-w-5xl py-6">
        <div className="relative mb-10 text-center">
          <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-400/20 blur-[100px]" />
          <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">Select Your Role</h1>
          <p className="mt-3 text-[15px] text-ink-2">Secure encrypted access to your Prevntiv workspace.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROLES.map((r, i) => (
            <Link
              key={r.key}
              href={r.href}
              className={cn(
                'group flex flex-col rounded-2xl border border-line-soft bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift animate-fade-up',
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                <r.icon className="size-5" />
              </span>
              <h2 className="font-display text-xl font-semibold text-ink">{r.title}</h2>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-3">{r.desc}</p>
              <span className={cn('mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold', r.accent ? 'text-brand-700' : 'text-ink-2 group-hover:text-brand-700')}>
                {r.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-dashed border-brand-200 bg-white/70 p-5 backdrop-blur sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Just looking around?</p>
              <p className="text-xs text-ink-3">Explore any workspace with sample data — no account needed.</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {DEMOS.map((d) => (
              <button
                key={d.role}
                onClick={() => {
                  enterDemo(d.role);
                  setLocation(d.home);
                }}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-2 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-3">
          <Shield className="mr-1 inline size-3.5 -translate-y-px" />
          Prevntiv platform team?{' '}
          <Link href="/auth/login?role=admin" className="font-semibold text-brand-700 hover:underline">
            Administrator sign in
          </Link>
        </p>
      </div>
    </AuthFrame>
  );
}
