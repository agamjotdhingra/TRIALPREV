import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { href: '/lab/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/lab/search', icon: '🔍', label: 'Search Patient' },
  { href: '/lab/upload', icon: '📤', label: 'Upload Report' },
  { href: '/lab/reports', icon: '🧪', label: 'My Reports' },
];

export default function LabAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      brandColor="amber"
      roleLabel="Lab Portal"
      roleIcon="🔬"
    >
      {children}
    </SidebarLayout>
  );
}
