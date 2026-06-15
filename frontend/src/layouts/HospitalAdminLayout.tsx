import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/hospital/dashboard', icon: '📊', label: 'Command Center' },
  { href: '/hospital/wards', icon: '🏢', label: 'Wards & Beds' },
  { href: '/hospital/admissions', icon: '📥', label: 'Admissions' },
  { href: '/hospital/staff', icon: '👥', label: 'Staff Management' },
];

export default function HospitalAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      brandColor="violet"
      roleLabel="Hospital Portal"
      roleIcon="🏥"
    >
      {children}
    </SidebarLayout>
  );
}
