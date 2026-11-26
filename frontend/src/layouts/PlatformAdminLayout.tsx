import type { ReactNode } from 'react';
import { AppShell, type ShellConfig } from './AppShell';

const CONFIG: ShellConfig = {
  roleLabel: 'Platform Administrator',
  notificationsHref: '/admin/notifications',
  notifications: [
    { title: '12 applications awaiting verification', time: 'Now' },
    { title: 'Critical risk alert: Meenakshi Iyer', time: '45 mins ago' },
  ],
  nav: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Verifications', href: '/admin/verifications' },
    {
      label: 'Entities',
      href: '/admin/patients',
      children: [
        { label: 'Patient Registry', href: '/admin/patients', description: 'All registered patients and risk levels' },
        { label: 'Doctor Registry', href: '/admin/doctors', description: 'Clinicians, specializations, licensing' },
        { label: 'Hospital Registry', href: '/admin/hospitals', description: 'Accredited healthcare facilities' },
        { label: 'Lab Registry', href: '/admin/labs', description: 'Diagnostic partner network' },
      ],
    },
    { label: 'Notifications', href: '/admin/notifications' },
  ],
};

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return <AppShell config={CONFIG}>{children}</AppShell>;
}
