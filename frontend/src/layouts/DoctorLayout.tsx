import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/doctor/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/doctor/queue', icon: '🚶', label: "Today's Queue" },
  { href: '/doctor/appointments', icon: '📅', label: 'Appointments' },
  { href: '/doctor/patients', icon: '👥', label: 'My Patients' },
  { href: '/doctor/prescriptions/new', icon: '📝', label: 'Create Prescription' },
  { href: '/doctor/profile', icon: '👤', label: 'My Profile' },
];

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      brandColor="emerald"
      roleLabel="Doctor Portal"
      roleIcon="🩺"
    >
      {children}
    </SidebarLayout>
  );
}
