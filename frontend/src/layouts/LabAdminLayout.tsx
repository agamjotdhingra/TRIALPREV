import type { ReactNode } from 'react';
import { AppShell, type ShellConfig } from './AppShell';

const CONFIG: ShellConfig = {
  roleLabel: 'Lab Administrator',
  notificationsHref: '/lab/reports',
  notifications: [{ title: '2 critical reports need review', time: 'Today, 09:45 AM' }],
  nav: [
    { label: 'Dashboard', href: '/lab/dashboard' },
    { label: 'Search Patient', href: '/lab/search' },
    { label: 'Reports', href: '/lab/reports' },
    { label: 'Upload Report', href: '/lab/upload' },
  ],
};

export default function LabAdminLayout({ children }: { children: ReactNode }) {
  return <AppShell config={CONFIG}>{children}</AppShell>;
}
