import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  HeartPulse,
  Pill,
  FlaskConical,
  FolderOpen,
  UserCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/patient/dashboard',     icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { href: '/patient/appointments',  icon: <CalendarDays    className="w-4 h-4" />, label: 'Appointments' },
  { href: '/patient/records',       icon: <HeartPulse      className="w-4 h-4" />, label: 'My Health Record' },
  { href: '/patient/prescriptions', icon: <Pill            className="w-4 h-4" />, label: 'Prescriptions' },
  { href: '/patient/reports',       icon: <FlaskConical    className="w-4 h-4" />, label: 'Lab Reports' },
  { href: '/patient/documents',     icon: <FolderOpen      className="w-4 h-4" />, label: 'Documents' },
  { href: '/patient/profile',       icon: <UserCircle      className="w-4 h-4" />, label: 'Profile' },
];

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      roleLabel="Patient Portal"
    >
      {children}
    </SidebarLayout>
  );
}
