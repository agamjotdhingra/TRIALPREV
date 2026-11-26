import { useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { supabase } from '@/api/supabase';
import { Btn, Field, Input } from '@/components/kit';
import { AuthCard, AuthFrame } from '@/pages/public/AuthFrame';

const COPY: Record<string, { title: string; sub: string; signup?: { href: string; label: string } }> = {
  doctor: { title: 'Professional Login', sub: 'Doctors, physiotherapists and nutritionists sign in to their clinical workspace.', signup: { href: '/auth/signup/professional', label: 'Apply to join as a professional' } },
  hospital: { title: 'Hospital Admin Login', sub: 'Manage wards, admissions, staff and facility operations.', signup: { href: '/auth/signup/hospital', label: 'Register your hospital' } },
  lab: { title: 'Lab Portal Login', sub: 'Publish reports and manage diagnostic requisitions.', signup: { href: '/auth/signup/lab', label: 'Register your laboratory' } },
  admin: { title: 'Platform Admin Login', sub: 'Restricted to the Prevntiv operations team.' },
  patient: { title: 'Patient Login', sub: 'Sign in with the email and password linked to your Prevntiv ID.', signup: { href: '/auth/phone', label: 'New here? Create your Prevntiv ID' } },
};

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const role = new URLSearchParams(useSearch()).get('role') ?? 'doctor';
  const copy = COPY[role] ?? COPY.doctor;
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const isPhone = /^\+?[\d\s-]{10,}$/.test(identifier.trim());
    if (isPhone) {
      // Mobile numbers sign in with a one-time code.
      setLocation(`/auth/phone?phone=${encodeURIComponent(identifier.replace(/\D/g, '').slice(-10))}`);
      return;
    }
    if (!password) return setError('Enter your password.');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: identifier.trim(), password });
    setLoading(false);
    if (err) return setError(err.message === 'Invalid login credentials' ? 'That email and password combination is not recognised.' : err.message);
    setLocation('/');
  }

  return (
    <AuthFrame back={{ href: '/role', label: 'Back to roles' }}>
      <AuthCard className="max-w-[440px]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-[28px] font-bold text-ink">{copy.title}</h1>
          <p className="mt-2 text-sm text-ink-3">{copy.sub}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <Field label={<span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3">Email or mobile number</span>} htmlFor="identifier">
            <Input id="identifier" autoFocus autoComplete="username" placeholder="Enter your email or mobile" leftIcon={<Mail />} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </Field>
          <Field
            label={<span className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3">Password</span>}
            htmlFor="password"
            aside={
              <a href="mailto:support@prevntiv.in?subject=Password%20reset" className="text-xs font-semibold text-brand-700 hover:underline">
                Forgot?
              </a>
            }
          >
            <div className="relative">
              <Input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" leftIcon={<Lock />} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-11" />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-4 hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-700">{error}</p>}
          <Btn type="submit" block size="lg" shape="rounded" loading={loading} iconRight={<ArrowRight className="size-4" />}>
            Sign In
          </Btn>
          <Link href="/auth/phone" className="block text-center text-[13px] font-semibold text-brand-700 hover:underline">
            Login with OTP instead
          </Link>
        </form>
        {copy.signup && (
          <p className="mt-8 border-t border-line-soft pt-5 text-center text-[13px] text-ink-3">
            Don't have an account?{' '}
            <Link href={copy.signup.href} className="font-semibold text-brand-700 hover:underline">
              {copy.signup.label}
            </Link>
          </p>
        )}
      </AuthCard>
    </AuthFrame>
  );
}
