import { useState } from 'react';
import { Link } from 'wouter';
import { post } from '@/api/client';
import { ShieldCheck, CheckCircle, ArrowRight, Stethoscope, FlaskConical, Building2 } from 'lucide-react';

type ApplyRole = 'doctor' | 'lab_admin' | 'hospital_admin';

const ROLE_OPTIONS: { value: ApplyRole; label: string; desc: string; Icon: any }[] = [
  { value: 'doctor', label: 'Doctor', desc: 'Medical practitioner', Icon: Stethoscope },
  { value: 'lab_admin', label: 'Lab', desc: 'Diagnostic laboratory', Icon: FlaskConical },
  { value: 'hospital_admin', label: 'Hospital', desc: 'Hospital administrator', Icon: Building2 },
];

export default function ApplyPage() {
  const [role, setRole] = useState<ApplyRole>('doctor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '',
    // Doctor fields
    specialization: '', qualification: '', yearsOfExperience: '',
    licenseNumber: '', consultationFees: '', bio: '',
    // Lab fields
    labName: '', registrationNumber: '', address: '',
    // Hospital fields
    hospitalName: '', totalBeds: '',
  });

  function update(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, unknown> = { role, fullName: form.fullName, email: form.email, mobile: form.mobile };
      if (role === 'doctor') {
        Object.assign(body, { specialization: form.specialization, qualification: form.qualification, yearsOfExperience: parseInt(form.yearsOfExperience) || 0, licenseNumber: form.licenseNumber, consultationFees: form.consultationFees ? parseFloat(form.consultationFees) : undefined, bio: form.bio });
      } else if (role === 'lab_admin') {
        Object.assign(body, { labName: form.labName, registrationNumber: form.registrationNumber, address: form.address });
      } else {
        Object.assign(body, { hospitalName: form.hospitalName, registrationNumber: form.registrationNumber, address: form.address, totalBeds: form.totalBeds ? parseInt(form.totalBeds) : undefined });
      }
      await post('/auth/apply', body);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all';
  const inputStyle = { background: 'hsl(150 30% 97%)', border: '1.5px solid hsl(150 20% 88%)', color: 'hsl(152 30% 10%)' };
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

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(150 30% 97%)' }}>
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
             style={{ background: 'linear-gradient(135deg, hsl(152 55% 40%) 0%, hsl(162 52% 46%) 100%)', boxShadow: '0 8px 32px hsl(152 72% 32% / 0.35)' }}>
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-3" style={{ color: 'hsl(152 30% 10%)' }}>Application Submitted!</h2>
        <p className="mb-8" style={{ color: 'hsl(150 15% 45%)' }}>
          Our team will review your application and send you an email invite once approved. This typically takes 1–2 business days.
        </p>
        <Link href="/auth/login">
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white cursor-pointer transition-all"
                style={{ background: 'linear-gradient(135deg, hsl(152 55% 38%) 0%, hsl(162 52% 44%) 100%)', boxShadow: '0 4px 16px hsl(152 72% 32% / 0.35)' }}>
            Back to Login <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(145deg, hsl(152 45% 18%) 0%, hsl(152 50% 28%) 50%, hsl(162 48% 22%) 100%)' }}>
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: 'radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute bottom-0 -right-16 w-72 h-72 rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(162 65% 55%) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'hsl(152 50% 42% / 0.3)', border: '1px solid hsl(152 50% 50% / 0.4)' }}>
            <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(152 35% 72%)' }} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">preventiv</span>
        </div>

        <div className="relative z-10 space-y-4">
          <h2 className="text-3xl font-bold text-white">Join the Preventiv<br />professional network.</h2>
          <p style={{ color: 'hsl(152 28% 72%)' }}>
            Connect with patients, manage appointments, and streamline your practice — all in one trusted platform.
          </p>
          <div className="space-y-2 pt-2">
            {[
              'Verified professional badge',
              'Digital appointment management',
              'Integrated prescriptions & reports',
              'Secure patient data access',
            ].map(t => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(152 72% 55%)' }} />
                <span className="text-sm" style={{ color: 'hsl(152 28% 75%)' }}>{t}</span>
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
               style={{ background: 'linear-gradient(135deg, hsl(152 55% 40%) 0%, hsl(162 52% 46%) 100%)' }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'hsl(152 55% 42%)' }}>preventiv</span>
        </div>

        <div className="w-full max-w-lg">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'hsl(152 30% 10%)' }}>Professional Access Application</h1>
            <p className="text-sm" style={{ color: 'hsl(150 15% 50%)' }}>Select your role and submit your credentials for review.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            {ROLE_OPTIONS.map(({ value, label, desc, Icon }) => (
              <button key={value} type="button" onClick={() => setRole(value)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-semibold transition-all"
                style={role === value ? {
                  background: 'linear-gradient(135deg, hsl(152 72% 32% / 0.1) 0%, hsl(162 65% 38% / 0.1) 100%)',
                  border: '2px solid hsl(152 72% 40%)',
                  color: 'hsl(152 72% 30%)',
                  boxShadow: '0 0 0 4px hsl(152 72% 36% / 0.08)',
                } : {
                  background: 'hsl(150 30% 97%)',
                  border: '1.5px solid hsl(150 20% 88%)',
                  color: 'hsl(150 15% 45%)',
                }}>
                <Icon className="w-5 h-5" />
                <div className="text-center">
                  <div>{label}</div>
                  <div className="text-xs font-normal opacity-70">{desc}</div>
                </div>
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 mb-5 flex items-start gap-3"
                 style={{ background: 'hsl(4 86% 58% / 0.08)', border: '1px solid hsl(4 86% 58% / 0.25)', color: 'hsl(4 72% 45%)' }}>
              <span className="text-base mt-0.5">⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'hsl(152 30% 28%)' }}>Personal Information</h3>
            <div>
              <label className={labelCls} style={labelStyle}>Full Name *</label>
              <input className={inputCls} style={inputStyle} required value={form.fullName}
                onChange={e => update('fullName', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="Dr. John Smith" />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Email *</label>
              <input type="email" className={inputCls} style={inputStyle} required value={form.email}
                onChange={e => update('email', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="doctor@clinic.com" />
            </div>
            <div>
              <label className={labelCls} style={labelStyle}>Mobile *</label>
              <input className={inputCls} style={inputStyle} required value={form.mobile}
                onChange={e => update('mobile', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="+91 9876543210" />
            </div>

            {role === 'doctor' && (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wider pt-2" style={{ color: 'hsl(152 30% 28%)' }}>Professional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Specialization *</label>
                    <input className={inputCls} style={inputStyle} required value={form.specialization}
                      onChange={e => update('specialization', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="Cardiology" />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Experience (years) *</label>
                    <input type="number" className={inputCls} style={inputStyle} required min="0" value={form.yearsOfExperience}
                      onChange={e => update('yearsOfExperience', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Qualification *</label>
                  <input className={inputCls} style={inputStyle} required value={form.qualification}
                    onChange={e => update('qualification', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="MBBS, MD" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>License Number</label>
                    <input className={inputCls} style={inputStyle} value={form.licenseNumber}
                      onChange={e => update('licenseNumber', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Consultation Fees (₹)</label>
                    <input type="number" className={inputCls} style={inputStyle} value={form.consultationFees}
                      onChange={e => update('consultationFees', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Bio / About</label>
                  <textarea className={inputCls + ' resize-none'} style={{ ...inputStyle, display: 'block' } as any} rows={3} value={form.bio}
                    onChange={e => update('bio', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="Brief introduction..." />
                </div>
              </>
            )}

            {role === 'lab_admin' && (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wider pt-2" style={{ color: 'hsl(152 30% 28%)' }}>Lab Details</h3>
                <div>
                  <label className={labelCls} style={labelStyle}>Lab Name *</label>
                  <input className={inputCls} style={inputStyle} required value={form.labName}
                    onChange={e => update('labName', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="Apollo Diagnostics" />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Registration Number *</label>
                  <input className={inputCls} style={inputStyle} required value={form.registrationNumber}
                    onChange={e => update('registrationNumber', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Address</label>
                  <input className={inputCls} style={inputStyle} value={form.address}
                    onChange={e => update('address', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="Full address" />
                </div>
              </>
            )}

            {role === 'hospital_admin' && (
              <>
                <h3 className="text-sm font-bold uppercase tracking-wider pt-2" style={{ color: 'hsl(152 30% 28%)' }}>Hospital Details</h3>
                <div>
                  <label className={labelCls} style={labelStyle}>Hospital Name *</label>
                  <input className={inputCls} style={inputStyle} required value={form.hospitalName}
                    onChange={e => update('hospitalName', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} placeholder="City General Hospital" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} style={labelStyle}>Registration No. *</label>
                    <input className={inputCls} style={inputStyle} required value={form.registrationNumber}
                      onChange={e => update('registrationNumber', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                  <div>
                    <label className={labelCls} style={labelStyle}>Total Beds</label>
                    <input type="number" className={inputCls} style={inputStyle} value={form.totalBeds}
                      onChange={e => update('totalBeds', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} style={labelStyle}>Address</label>
                  <input className={inputCls} style={inputStyle} value={form.address}
                    onChange={e => update('address', e.target.value)} onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </>
            )}

            <button id="apply-submit" type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, hsl(152 72% 32%) 0%, hsl(162 65% 38%) 100%)', boxShadow: '0 4px 16px hsl(152 72% 32% / 0.35)' }}>
              {loading ? 'Submitting...' : <><span>Submit Application</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(150 15% 50%)' }}>
            Already have access?{' '}
            <Link href="/auth/login">
              <span className="font-semibold cursor-pointer" style={{ color: 'hsl(152 72% 32%)' }}>Sign in</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
