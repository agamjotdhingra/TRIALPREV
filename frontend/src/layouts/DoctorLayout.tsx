import type { ReactNode } from 'react';
import { AppShell, type ShellConfig } from './AppShell';

const CONFIG: ShellConfig = {
  roleLabel: 'Doctor · Active duty',
  profileHref: '/doctor/profile',
  notificationsHref: '/doctor/queue',
  notifications: [
    { title: 'Ananya Sharma flagged critical — chest pain', time: '2 mins ago' },
    { title: 'New lab report: Lipid Profile for Priya Sharma', time: '1 hour ago' },
  ],
  nav: [
    { label: 'Dashboard', href: '/doctor/dashboard', match: ['/doctor/profile'] },
    { label: 'Patients', href: '/doctor/patients' },
    { label: 'Schedule', href: '/doctor/appointments' },
    { label: 'Queue', href: '/doctor/queue' },
    { label: 'Prescriptions', href: '/doctor/prescriptions/new', match: ['/doctor/prescriptions'] },
    { label: 'Chat', href: '/doctor/chat' },
  ],
};

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return <AppShell config={CONFIG}>{children}</AppShell>;
}
