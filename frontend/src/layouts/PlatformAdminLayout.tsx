import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FlaskConical,
  Building2,
  BadgeCheck,
  Bell,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin/dashboard',     icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { href: '/admin/patients',      icon: <Users           className="w-4 h-4" />, label: 'Patients' },
  { href: '/admin/doctors',       icon: <Stethoscope     className="w-4 h-4" />, label: 'Doctors' },
  { href: '/admin/labs',          icon: <FlaskConical    className="w-4 h-4" />, label: 'Labs' },
  { href: '/admin/hospitals',     icon: <Building2       className="w-4 h-4" />, label: 'Hospitals' },
  { href: '/admin/verifications', icon: <BadgeCheck      className="w-4 h-4" />, label: 'Verifications' },
  { href: '/admin/notifications', icon: <Bell            className="w-4 h-4" />, label: 'Notifications' },
];

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      roleLabel="Admin Console"
    >
      {children}
    </SidebarLayout>
  );
}
