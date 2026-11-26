import { useEffect, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { ArrowRight, CircleHelp, Smartphone } from 'lucide-react';
import { supabase } from '@/api/supabase';
import { get } from '@/api/client';
import { Btn, Callout, OtpInput } from '@/components/kit';
import { AuthCard, AuthFrame } from '@/pages/public/AuthFrame';
import { useAuth } from './AuthContext';

/** Patient sign-in: mobile number → 6-digit SMS code (Supabase phone OTP). */
export default function PhoneVerify() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(useSearch());
  const { enterDemo } = useAuth();
  const [phone, setPhone] = useState(params.get('phone') ?? '');
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const digits = phone.replace(/\D/g, '');
  const e164 = `+91${digits}`;

  async function sendCode() {
    if (digits.length !== 10) return setError('Enter a valid 10-digit mobile number.');
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: e164 });
    setLoading(false);
    if (err) return setError(err.message);
    setStage('code');
    setCode('');
    setSeconds(30);
  }

  async function verify() {
    if (code.replace(/\s/g, '').length !== 6) return setError('Enter the 6-digit code.');
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({ phone: e164, token: code, type: 'sms' });
    if (err) {
      setLoading(false);
      return setError(err.message);
    }
    try {
      await get('/auth/me');
      setLocation('/');
    } catch {
      // Verified but no Prevntiv profile yet → first-time onboarding.
      setLocation('/onboarding');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFrame back={{ href: '/role', label: 'Back to roles' }}>
      <AuthCard className="max-w-[420px] text-center">
        <span className="mx-auto mb-5 inline-flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <Smartphone className="size-5" />
        </span>

        {stage === 'phone' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendCode();
            }}
          >
            <h1 className="font-display text-[28px] font-bold text-ink">Verify your phone</h1>
            <p className="mt-2 text-sm text-ink-3">We'll text you a one-time code to sign in or create your Prevntiv ID.</p>
            <label className="mt-7 block text-left text-[11px] font-bold uppercase tracking-[0.1em] text-ink-3" htmlFor="phone">
              Phone number
            </label>
            <div className="mt-2 flex h-12 overflow-hidden rounded-xl border border-line bg-white transition-all focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
              <span className="flex items-center border-r border-line bg-slate-50 px-3.5 text-sm font-semibold text-ink-2">🇮🇳 +91</span>
              <input
                id="phone"
                autoFocus
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, '').slice(0, 11))}
                className="flex-1 bg-transparent px-3.5 text-[15px] font-medium tracking-wide text-ink outline-none placeholder:text-ink-4"
              />
            </div>
            {error && <p className="mt-3 text-left text-xs font-medium text-red-600">{error}</p>}
            <Btn type="submit" block size="lg" shape="rounded" className="mt-6" loading={loading} iconRight={<ArrowRight className="size-4" />}>
              Send code
            </Btn>
            <p className="mt-5 text-xs text-ink-3">
              New to Prevntiv?{' '}
              <Link href="/onboarding" className="font-semibold text-brand-700 hover:underline">
                Create your Prevntiv ID
              </Link>
              <span className="mx-1.5">·</span>
              Prefer email?{' '}
              <Link href="/auth/login?role=patient" className="font-semibold text-brand-700 hover:underline">
                Sign in with password
              </Link>
            </p>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
          >
            <h1 className="font-display text-[28px] font-bold text-ink">Enter the code</h1>
            <p className="mx-auto mt-2 max-w-[260px] text-sm text-ink-2">
              We've sent a 6-digit code to <b className="font-semibold text-ink">+91 {phone}</b>.{' '}
              <button type="button" className="font-semibold text-brand-700 hover:underline" onClick={() => setStage('phone')}>
                Edit
              </button>
            </p>
            <div className="mt-7">
              <OtpInput value={code} onChange={setCode} invalid={!!error} />
            </div>
            <p className="mt-5 text-[13px] text-ink-3">
              {seconds > 0 ? (
                <>
                  Resend code in <b className="num font-semibold text-ink">00:{String(seconds).padStart(2, '0')}</b>
                </>
              ) : (
                <button type="button" onClick={sendCode} className="font-semibold text-brand-700 hover:underline">
                  Resend OTP
                </button>
              )}
            </p>
            {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
            <Btn type="submit" block size="lg" shape="rounded" className="mt-6" loading={loading} iconRight={<ArrowRight className="size-4" />}>
              Verify &amp; Continue
            </Btn>
            <button type="button" onClick={() => setHelp((h) => !h)} className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-brand-700">
              <CircleHelp className="size-4" /> Didn't receive the code?
            </button>
            {help && (
              <Callout tone="blue" className="mt-4 text-left">
                Check the number is correct and that your phone has signal. Codes expire after 10 minutes — tap <b>Resend OTP</b> to get a fresh one.
              </Callout>
            )}
          </form>
        )}

        {error && (
          <p className="mt-6 border-t border-line-soft pt-4 text-xs text-ink-3">
            Can't sign in right now?{' '}
            <button
              className="font-semibold text-brand-700 hover:underline"
              onClick={() => {
                enterDemo('patient');
                setLocation('/patient/dashboard');
              }}
            >
              Explore the patient portal with sample data
            </button>
          </p>
        )}
      </AuthCard>
    </AuthFrame>
  );
}
