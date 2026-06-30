import { useState } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/api/supabase';
import { Link } from 'wouter';
import { ShieldCheck, ArrowRight, Lock, Mail, Leaf } from 'lucide-react';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setLocation('/');
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
           style={{ background: 'linear-gradient(145deg, hsl(152 45% 18%) 0%, hsl(152 50% 28%) 50%, hsl(162 48% 22%) 100%)' }}>
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, hsl(152 72% 50%) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15"
               style={{ background: 'radial-gradient(circle, hsl(162 65% 55%) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, hsl(140 60% 60%) 0%, transparent 70%)' }} />
        </div>

        {/* Grid dots pattern */}
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'hsl(152 50% 42% / 0.3)', border: '1px solid hsl(152 50% 50% / 0.4)' }}>
              <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(152 35% 72%)' }} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">preventiv</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Healthcare,<br />
              <span style={{ color: 'hsl(152 72% 65%)' }}>reimagined.</span>
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: 'hsl(152 28% 72%)' }}>
              A unified platform connecting patients, doctors, hospitals, and labs — all in one trusted space.
            </p>
          </div>

          {/* Trust signals */}
          <div className="space-y-3">
            {[
              { icon: '🔒', text: 'End-to-end encrypted health records' },
              { icon: '🩺', text: 'Verified doctors & healthcare providers' },
              { icon: '⚡', text: 'Real-time appointments & prescriptions' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm" style={{ color: 'hsl(152 20% 78%)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'hsl(152 20% 50%)' }}>
            © 2025 Preventiv Health Technologies Pvt. Ltd.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12" style={{ background: '#fff' }}>
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, hsl(152 55% 42%) 0%, hsl(162 65% 42%) 100%)' }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'hsl(152 55% 42%)' }}>preventiv</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(152 30% 10%)' }}>Welcome back</h1>
            <p style={{ color: 'hsl(150 15% 45%)' }}>Sign in to your Preventiv account to continue.</p>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-6 flex items-start gap-3"
                 style={{ background: 'hsl(4 86% 58% / 0.08)', border: '1px solid hsl(4 86% 58% / 0.25)', color: 'hsl(4 72% 45%)' }}>
              <span className="text-base mt-0.5">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'hsl(152 30% 15%)' }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(150 15% 55%)' }} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{
                    background: 'hsl(150 30% 97%)',
                    border: '1.5px solid hsl(150 20% 88%)',
                    color: 'hsl(152 30% 10%)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'hsl(152 55% 42%)'; e.target.style.boxShadow = '0 0 0 3px hsl(152 72% 36% / 0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'hsl(150 20% 88%)'; e.target.style.boxShadow = 'none'; }}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'hsl(152 30% 15%)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(150 15% 55%)' }} />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                  style={{
                    background: 'hsl(150 30% 97%)',
                    border: '1.5px solid hsl(150 20% 88%)',
                    color: 'hsl(152 30% 10%)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'hsl(152 55% 42%)'; e.target.style.boxShadow = '0 0 0 3px hsl(152 72% 36% / 0.12)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'hsl(150 20% 88%)'; e.target.style.boxShadow = 'none'; }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading ? 'hsl(152 55% 42%)' : 'linear-gradient(135deg, hsl(152 55% 42%) 0%, hsl(162 65% 38%) 100%)',
                boxShadow: '0 4px 16px hsl(152 72% 32% / 0.35)',
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px hsl(152 72% 32% / 0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px hsl(152 72% 32% / 0.35)'; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 space-y-3 text-sm" style={{ borderTop: '1px solid hsl(150 20% 90%)' }}>
            <p style={{ color: 'hsl(150 15% 50%)' }}>
              New patient?{' '}
              <Link href="/auth/register">
                <span className="font-semibold cursor-pointer transition-colors" style={{ color: 'hsl(152 72% 32%)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'hsl(152 50% 36%)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'hsl(152 72% 32%)'; }}>
                  Create your account →
                </span>
              </Link>
            </p>
            <p style={{ color: 'hsl(150 15% 50%)' }}>
              Doctor / Lab / Hospital?{' '}
              <Link href="/auth/apply">
                <span className="font-semibold cursor-pointer transition-colors" style={{ color: 'hsl(152 72% 32%)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'hsl(152 50% 36%)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'hsl(152 72% 32%)'; }}>
                  Apply for access →
                </span>
              </Link>
            </p>
          </div>

          {/* Trust badge */}
          <div className="mt-8 flex items-center gap-2 p-3 rounded-xl"
               style={{ background: 'hsl(152 50% 92%)', border: '1px solid hsl(152 40% 84%)' }}>
            <Leaf className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(152 72% 36%)' }} />
            <p className="text-xs" style={{ color: 'hsl(152 28% 40%)' }}>
              Your health data is protected with AES-256 encryption and is never shared without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
