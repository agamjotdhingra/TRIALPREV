import { useState } from 'react';
import { Link } from 'wouter';
import { post } from '@/api/client';

type ApplyRole = 'doctor' | 'lab_admin' | 'hospital_admin';

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

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm";
  const labelCls = "block text-sm font-medium text-slate-300 mb-1";

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Application Submitted!</h2>
        <p className="text-slate-400 mb-6">Our team will review your application and send you an email invite once approved. This typically takes 1-2 business days.</p>
        <Link href="/auth/login" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-6 rounded-lg transition">Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">HealthOS</h1>
          <p className="text-slate-400 text-sm mt-1">Professional Access Application</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {([['doctor','👨‍⚕️ Doctor'], ['lab_admin','🔬 Lab'], ['hospital_admin','🏥 Hospital']] as [ApplyRole, string][]).map(([r, label]) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`py-2.5 rounded-lg text-sm font-medium transition ${role === r ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-white font-semibold">Personal Information</h3>
            <div><label className={labelCls}>Full Name *</label><input className={inputCls} required value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Dr. John Smith" /></div>
            <div><label className={labelCls}>Email *</label><input type="email" className={inputCls} required value={form.email} onChange={e => update('email', e.target.value)} placeholder="doctor@clinic.com" /></div>
            <div><label className={labelCls}>Mobile *</label><input className={inputCls} required value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="+91 9876543210" /></div>

            {role === 'doctor' && (
              <>
                <h3 className="text-white font-semibold pt-2">Professional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Specialization *</label><input className={inputCls} required value={form.specialization} onChange={e => update('specialization', e.target.value)} placeholder="Cardiology" /></div>
                  <div><label className={labelCls}>Experience (years) *</label><input type="number" className={inputCls} required min="0" value={form.yearsOfExperience} onChange={e => update('yearsOfExperience', e.target.value)} /></div>
                </div>
                <div><label className={labelCls}>Qualification *</label><input className={inputCls} required value={form.qualification} onChange={e => update('qualification', e.target.value)} placeholder="MBBS, MD" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>License Number</label><input className={inputCls} value={form.licenseNumber} onChange={e => update('licenseNumber', e.target.value)} /></div>
                  <div><label className={labelCls}>Consultation Fees (₹)</label><input type="number" className={inputCls} value={form.consultationFees} onChange={e => update('consultationFees', e.target.value)} /></div>
                </div>
                <div><label className={labelCls}>Bio / About</label><textarea className={`${inputCls} resize-none`} rows={3} value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Brief introduction..." /></div>
              </>
            )}

            {role === 'lab_admin' && (
              <>
                <h3 className="text-white font-semibold pt-2">Lab Details</h3>
                <div><label className={labelCls}>Lab Name *</label><input className={inputCls} required value={form.labName} onChange={e => update('labName', e.target.value)} placeholder="Apollo Diagnostics" /></div>
                <div><label className={labelCls}>Registration Number *</label><input className={inputCls} required value={form.registrationNumber} onChange={e => update('registrationNumber', e.target.value)} /></div>
                <div><label className={labelCls}>Address</label><input className={inputCls} value={form.address} onChange={e => update('address', e.target.value)} placeholder="Full address" /></div>
              </>
            )}

            {role === 'hospital_admin' && (
              <>
                <h3 className="text-white font-semibold pt-2">Hospital Details</h3>
                <div><label className={labelCls}>Hospital Name *</label><input className={inputCls} required value={form.hospitalName} onChange={e => update('hospitalName', e.target.value)} placeholder="City General Hospital" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Registration No. *</label><input className={inputCls} required value={form.registrationNumber} onChange={e => update('registrationNumber', e.target.value)} /></div>
                  <div><label className={labelCls}>Total Beds</label><input type="number" className={inputCls} value={form.totalBeds} onChange={e => update('totalBeds', e.target.value)} /></div>
                </div>
                <div><label className={labelCls}>Address</label><input className={inputCls} value={form.address} onChange={e => update('address', e.target.value)} /></div>
              </>
            )}

            <button id="apply-submit" type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition mt-2">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
          <p className="text-center text-slate-400 text-sm mt-4">
            Already have access? <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
