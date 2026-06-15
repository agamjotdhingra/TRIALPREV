import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/admin/patients', icon: '👥', label: 'Patients' },
  { href: '/admin/doctors', icon: '🩺', label: 'Doctors' },
  { href: '/admin/labs', icon: '🔬', label: 'Labs' },
  { href: '/admin/hospitals', icon: '🏥', label: 'Hospitals' },
  { href: '/admin/verifications', icon: '✓', label: 'Verifications' },
  { href: '/admin/notifications', icon: '🔔', label: 'Notifications' },
];

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      brandColor="rose"
      roleLabel="Admin Console"
      roleIcon="🛡️"
    >
      {children}
    </SidebarLayout>
  );
}
