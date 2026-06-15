export function calculateBmi(height?: number | null, weight?: number | null): number | null {
  if (!height || !weight) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

export function computeHealthScore(patient: {
  bmi?: number | null;
  existingDiseases?: string | null;
  chronicDiseases?: string | null;
  smokingStatus?: string | null;
  alcoholConsumption?: string | null;
}): { score: number; riskLevel: string } {
  let score = 100;
  const { bmi } = patient;

  if (bmi != null) {
    if (bmi < 18.5 || bmi > 30) score -= 15;
    else if (bmi > 25) score -= 8;
  }
  if (patient.existingDiseases?.trim()) score -= 15;
  if (patient.chronicDiseases?.trim()) score -= 20;
  if (patient.smokingStatus?.toLowerCase() === 'yes') score -= 15;
  if (patient.alcoholConsumption?.toLowerCase() === 'yes') score -= 10;

  score = Math.max(0, Math.min(100, score));

  let riskLevel = 'healthy';
  if (score < 40) riskLevel = 'critical';
  else if (score < 60) riskLevel = 'high';
  else if (score < 80) riskLevel = 'moderate';

  return { score, riskLevel };
}

export function calcAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

export function generateHealthId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
  return `PVT-${year}-${num}`;
}

export function generateEmployeeId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `EMP-${year}-${num}`;
}
