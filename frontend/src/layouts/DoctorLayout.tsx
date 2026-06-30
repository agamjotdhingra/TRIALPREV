import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  ListOrdered,
  CalendarDays,
  Users,
  FilePen,
  UserCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/doctor/dashboard',          icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { href: '/doctor/queue',              icon: <ListOrdered     className="w-4 h-4" />, label: "Today's Queue" },
  { href: '/doctor/appointments',       icon: <CalendarDays    className="w-4 h-4" />, label: 'Appointments' },
  { href: '/doctor/patients',           icon: <Users           className="w-4 h-4" />, label: 'My Patients' },
  { href: '/doctor/prescriptions/new',  icon: <FilePen         className="w-4 h-4" />, label: 'Create Prescription' },
  { href: '/doctor/profile',            icon: <UserCircle      className="w-4 h-4" />, label: 'My Profile' },
];

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      roleLabel="Doctor Portal"
    >
      {children}
    </SidebarLayout>
  );
}
