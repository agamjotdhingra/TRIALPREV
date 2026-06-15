import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/patient/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/patient/appointments', icon: '📅', label: 'Appointments' },
  { href: '/patient/records', icon: '🏥', label: 'My Health Record' },
  { href: '/patient/prescriptions', icon: '💊', label: 'Prescriptions' },
  { href: '/patient/reports', icon: '🧪', label: 'Lab Reports' },
  { href: '/patient/documents', icon: '📁', label: 'Documents' },
  { href: '/patient/profile', icon: '👤', label: 'Profile' },
];

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      brandColor="blue"
      roleLabel="Patient Portal"
      roleIcon="🩹"
    >
      {children}
    </SidebarLayout>
  );
}
