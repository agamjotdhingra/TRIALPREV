import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { post } from '@/api/client';
import { supabase } from '@/api/supabase';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400 mb-6">Please check your email and confirm your account before logging in.</p>
          <Link href="/auth/login" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg transition">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1";
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">HealthOS</h1>
          <p className="text-slate-400 text-sm mt-1">Patient Registration</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} />
            ))}
          </div>
          <p className="text-slate-400 text-xs mb-6 text-right">Step {step} of 3</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1); } : handleSubmit}>
            {/* Step 1 — Account */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg mb-2">Account Details</h3>
                <div><label className={labelCls}>Full Name *</label><input className={inputCls} required value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="John Smith" /></div>
                <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} required value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@example.com" /></div>
                <div><label className={labelCls}>Mobile *</label><input className={inputCls} required value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="+91 9876543210" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Password *</label><input type="password" className={inputCls} required minLength={8} value={form.password} onChange={e => update('password', e.target.value)} placeholder="min. 8 chars" /></div>
                  <div><label className={labelCls}>Confirm Password *</label><input type="password" className={inputCls} required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="repeat password" /></div>
                </div>
              </div>
            )}

            {/* Step 2 — Basic Health Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg mb-2">Personal & Health Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Date of Birth *</label><input type="date" className={inputCls} required value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} /></div>
                  <div>
                    <label className={labelCls}>Gender *</label>
                    <select className={selectCls} required value={form.gender} onChange={e => update('gender', e.target.value)}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Blood Group</label>
                  <select className={selectCls} value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Height (cm)</label><input type="number" className={inputCls} value={form.height} onChange={e => update('height', e.target.value)} placeholder="170" /></div>
                  <div><label className={labelCls}>Weight (kg)</label><input type="number" className={inputCls} value={form.weight} onChange={e => update('weight', e.target.value)} placeholder="70" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Smoking</label>
                    <select className={selectCls} value={form.smokingStatus} onChange={e => update('smokingStatus', e.target.value)}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Alcohol</label>
                    <select className={selectCls} value={form.alcoholConsumption} onChange={e => update('alcoholConsumption', e.target.value)}>
                      <option value="no">No</option><option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Medical History */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg mb-2">Medical History (Optional)</h3>
                <div><label className={labelCls}>Existing Diseases</label><input className={inputCls} value={form.existingDiseases} onChange={e => update('existingDiseases', e.target.value)} placeholder="Diabetes, Hypertension..." /></div>
                <div><label className={labelCls}>Chronic Diseases</label><input className={inputCls} value={form.chronicDiseases} onChange={e => update('chronicDiseases', e.target.value)} placeholder="Asthma, COPD..." /></div>
                <div><label className={labelCls}>Allergies</label><input className={inputCls} value={form.allergies} onChange={e => update('allergies', e.target.value)} placeholder="Penicillin, Peanuts..." /></div>
                <div><label className={labelCls}>Current Medications</label><input className={inputCls} value={form.currentMedications} onChange={e => update('currentMedications', e.target.value)} placeholder="Metformin 500mg..." /></div>
                <div><label className={labelCls}>Family Medical History</label><input className={inputCls} value={form.familyMedicalHistory} onChange={e => update('familyMedicalHistory', e.target.value)} placeholder="Father - heart disease..." /></div>
                <div><label className={labelCls}>Vaccinations</label><input className={inputCls} value={form.vaccinations} onChange={e => update('vaccinations', e.target.value)} placeholder="COVID, Flu, Hepatitis B..." /></div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2.5 rounded-lg transition">
                  Back
                </button>
              )}
              <button
                id={step < 3 ? 'next-step' : 'register-submit'}
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition"
              >
                {step < 3 ? 'Continue' : loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <p className="text-center text-slate-400 text-sm mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
