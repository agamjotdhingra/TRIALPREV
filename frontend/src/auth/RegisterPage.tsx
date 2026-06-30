import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { post } from '@/api/client';
import { ShieldCheck, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const STEPS = [
  { num: 1, label: 'Account' },
  { num: 2, label: 'Health Info' },
  { num: 3, label: 'Medical History' },
];

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    fullName: '', mobile: '', dateOfBirth: '', gender: '', bloodGroup: '',
    height: '', weight: '',
    existingDiseases: '', allergies: '', currentMedications: '',
    smokingStatus: 'no', alcoholConsumption: 'no',
    familyMedicalHistory: '', chronicDiseases: '', vaccinations: '',
  });

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    setError('');
    setLoading(true);

    try {
      await post('/auth/register/patient', {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        mobile: form.mobile,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        existingDiseases: form.existingDiseases,
        allergies: form.allergies,
        currentMedications: form.currentMedications,
        smokingStatus: form.smokingStatus,
        alcoholConsumption: form.alcoholConsumption,
        familyMedicalHistory: form.familyMedicalHistory,
        chronicDiseases: form.chronicDiseases,
        vaccinations: form.vaccinations,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all`;
  const inputStyle = {
    background: 'hsl(150 30% 97%)',
    border: '1.5px solid hsl(150 20% 88%)',
    color: 'hsl(152 30% 10%)',
  };
  const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'hsl(152 72% 36%)';
    e.target.style.boxShadow = '0 0 0 3px hsl(152 72% 36% / 0.12)';
  };
  const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'hsl(150 20% 88%)';
    e.target.style.boxShadow = 'none';
  };
  const labelCls = 'block text-xs font-semibold mb-1 uppercase tracking-wide';
  const labelStyle = { color: 'hsl(152 30% 30%)' };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(150 30% 97%)' }}>
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
               style={{ background: 'linear-gradient(135deg, hsl(152 72% 36%) 0%, hsl(162 65% 42%) 100%)', boxShadow: '0 8px 32px hsl(152 72% 32% / 0.35)' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: 'hsl(152 30% 10%)' }}>Account Created!</h2>
          <p className="mb-8" style={{ color: 'hsl(150 15% 45%)' }}>
            Please check your email and confirm your account before logging in.
          </p>
          <Link href="/auth/login">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white cursor-pointer transition-all"
                  style={{ background: 'linear-gradient(135deg, hsl(152 72% 32%) 0%, hsl(162 65% 38%) 100%)', boxShadow: '0 4px 16px hsl(152 72% 32% / 0.35)' }}>
              Go to Login <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg, hsl(152 60% 12%) 0%, hsl(152 72% 20%) 50%, hsl(162 65% 16%) 100%)' }}>
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-32 -right-20 w-80 h-80 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(152 72% 50%) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'hsl(152 72% 36% / 0.3)', border: '1px solid hsl(152 72% 50% / 0.4)' }}>
            <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(152 72% 72%)' }} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">preventiv</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white">Your health journey<br />starts here.</h2>
          <p style={{ color: 'hsl(152 20% 72%)' }}>
            Create your Preventiv account in minutes and get access to your complete digital health record.
          </p>
          <div className="space-y-2 pt-2">
            {['Secure health profile', 'Appointment management', 'Digital prescriptions & lab reports'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(152 72% 55%)' }} />
                <span className="text-sm" style={{ color: 'hsl(152 20% 75%)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'hsl(152 20% 45%)' }}>
          © 2025 Preventiv Health Technologies Pvt. Ltd.
        </p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-y-auto" style={{ background: '#fff' }}>
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, hsl(152 72% 36%) 0%, hsl(162 65% 42%) 100%)' }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'hsl(152 60% 22%)' }}>preventiv</span>
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(152 30% 10%)' }}>Patient Registration</h1>
            <p className="text-sm" style={{ color: 'hsl(150 15% 50%)' }}>Complete your profile to access all features.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                       style={s.num < step
                         ? { background: 'hsl(152 72% 36%)', color: '#fff' }
                         : s.num === step
                         ? { background: 'linear-gradient(135deg, hsl(152 72% 32%) 0%, hsl(162 65% 38%) 100%)', color: '#fff', boxShadow: '0 2px 8px hsl(152 72% 32% / 0.4)' }
                         : { background: 'hsl(150 20% 92%)', color: 'hsl(150 15% 50%)' }}>
                    {s.num < step ? '✓' : s.num}
                  </div>
                  <span className="text-xs font-medium hidden sm:block" style={{ color: s.num <= step ? 'hsl(152 60% 22%)' : 'hsl(150 15% 55%)' }}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full mx-2 transition-all"
                       style={{ background: s.num < step ? 'hsl(152 72% 50%)' : 'hsl(150 20% 88%)' }} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
                 style={{ background: 'hsl(4 86% 58% / 0.08)', border: '1px solid hsl(4 86% 58% / 0.25)', color: 'hsl(4 72% 45%)' }}>
              <span className="text-base mt-0.5">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1); } : handleSubmit}>
            {/* Step 1 — Account */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base mb-3" style={{ color: 'hsl(152 30% 15%)' }}>Account Details</h3>
                <div>
                  <label className={labelCls} style={labelStyle}>Full Name *</label>
                  <input className={inputCls} style={inputStyle} required value={form.fullName}
                    onChange={e => update('fullName', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="John Smith" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Email *</label>
                  <input type="email" className={inputCls} style={inputStyle} required value={form.email}
                    onChange={e => update('email', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="john@example.com" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Mobile *</label>
                  <input className={inputCls} style={inputStyle} required value={form.mobile}
                    onChange={e => update('mobile', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="+91 9876543210" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Password *</label>
                    <input type="password" className={inputCls} style={inputStyle} required minLength={8} value={form.password}
                      onChange={e => update('password', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="min. 8 chars" />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Confirm Password *</label>
                    <input type="password" className={inputCls} style={inputStyle} required value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="repeat" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Health Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base mb-3" style={{ color: 'hsl(152 30% 15%)' }}>Personal & Health Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Date of Birth *</label>
                    <input type="date" className={inputCls} style={inputStyle} required value={form.dateOfBirth}
                      onChange={e => update('dateOfBirth', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Gender *</label>
                    <select className={inputCls + ' cursor-pointer'} style={inputStyle} required value={form.gender}
                      onChange={e => update('gender', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Blood Group</label>
                  <select className={inputCls + ' cursor-pointer'} style={inputStyle} value={form.bloodGroup}
                    onChange={e => update('bloodGroup', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Height (cm)</label>
                    <input type="number" className={inputCls} style={inputStyle} value={form.height}
                      onChange={e => update('height', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="170" />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Weight (kg)</label>
                    <input type="number" className={inputCls} style={inputStyle} value={form.weight}
                      onChange={e => update('weight', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="70" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Smoking</label>
                    <select className={inputCls + ' cursor-pointer'} style={inputStyle} value={form.smokingStatus}
                      onChange={e => update('smokingStatus', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Alcohol</label>
                    <select className={inputCls + ' cursor-pointer'} style={inputStyle} value={form.alcoholConsumption}
                      onChange={e => update('alcoholConsumption', e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Medical History */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-base mb-1" style={{ color: 'hsl(152 30% 15%)' }}>Medical History</h3>
                <p className="text-xs mb-3" style={{ color: 'hsl(150 15% 55%)' }}>All fields are optional but help your care team.</p>
                {[
                  { key: 'existingDiseases', label: 'Existing Diseases', placeholder: 'Diabetes, Hypertension...' },
                  { key: 'chronicDiseases', label: 'Chronic Diseases', placeholder: 'Asthma, COPD...' },
                  { key: 'allergies', label: 'Allergies', placeholder: 'Penicillin, Peanuts...' },
                  { key: 'currentMedications', label: 'Current Medications', placeholder: 'Metformin 500mg...' },
                  { key: 'familyMedicalHistory', label: 'Family Medical History', placeholder: 'Father - heart disease...' },
                  { key: 'vaccinations', label: 'Vaccinations', placeholder: 'COVID, Flu, Hepatitis B...' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className={labelCls} style={labelStyle}>{label}</label>
                    <input className={inputCls} style={inputStyle} value={(form as any)[key]}
                      onChange={e => update(key, e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder={placeholder} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: 'hsl(150 30% 95%)', border: '1.5px solid hsl(150 20% 88%)', color: 'hsl(152 30% 25%)' }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                id={step < 3 ? 'next-step' : 'register-submit'}
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, hsl(152 72% 32%) 0%, hsl(162 65% 38%) 100%)', boxShadow: '0 4px 16px hsl(152 72% 32% / 0.35)' }}>
                {step < 3 ? <>Continue <ArrowRight className="w-4 h-4" /></>
                  : loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(150 15% 50%)' }}>
            Already have an account?{' '}
            <Link href="/auth/login">
              <span className="font-semibold cursor-pointer" style={{ color: 'hsl(152 72% 32%)' }}>Sign in</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
