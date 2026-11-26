import type { ReactNode } from 'react';
import { AppShell, type ShellConfig } from './AppShell';

const CONFIG: ShellConfig = {
  roleLabel: 'Hospital Administrator',
  notifications: [
    { title: 'ICU Central at 95% capacity', time: '5 mins ago' },
    { title: 'Bed I-201 flagged for maintenance', time: '40 mins ago' },
  ],
  notificationsHref: '/hospital/beds',
  nav: [
    { label: 'Dashboard', href: '/hospital/dashboard' },
    { label: 'Admissions', href: '/hospital/admissions', match: ['/hospital/patients'] },
    { label: 'Bed Roster', href: '/hospital/beds' },
    { label: 'Wards', href: '/hospital/wards' },
    { label: 'Staff', href: '/hospital/staff' },
  ],
};

export default function HospitalAdminLayout({ children }: { children: ReactNode }) {
  return <AppShell config={CONFIG}>{children}</AppShell>;
}
