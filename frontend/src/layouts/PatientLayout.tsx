import type { ReactNode } from 'react';
import { AppShell, type ShellConfig } from './AppShell';

export const PATIENT_SHELL: ShellConfig = {
  roleLabel: 'Patient',
  profileHref: '/patient/profile',
  notificationsHref: '/patient/access/requests',
  notifications: [
    { title: 'Dr. Rohan Verma requested access to your records', time: '26 June 2026' },
    { title: 'Lipid Profile results are ready', time: '25 June 2026' },
  ],
  nav: [
    { label: 'Dashboard', href: '/patient/dashboard', match: ['/patient/health', '/patient/vitals', '/patient/profile'] },
    {
      label: 'Records',
      href: '/patient/records',
      match: ['/patient/reports', '/patient/prescriptions', '/patient/documents', '/patient/access'],
      children: [
        { label: 'Health Record', href: '/patient/records', description: 'Your complete EHR and clinical summaries' },
        { label: 'Lab Reports', href: '/patient/reports', description: 'Diagnostic history and results' },
        { label: 'Prescriptions', href: '/patient/prescriptions', description: 'Current and past medications' },
        { label: 'My Documents', href: '/patient/documents', description: 'Uploads, discharge papers, insurance' },
        { label: 'Access & Sharing', href: '/patient/access', description: 'Control who can see your records' },
      ],
    },
    { label: 'Appointments', href: '/patient/appointments' },
    { label: 'Chat', href: '/patient/chat' },
    { label: 'Billing', href: '/patient/billing' },
  ],
};

export default function PatientLayout({ children }: { children: ReactNode }) {
  return <AppShell config={PATIENT_SHELL}>{children}</AppShell>;
}
