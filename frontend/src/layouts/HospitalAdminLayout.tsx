import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  BedDouble,
  ClipboardPlus,
  Users,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/hospital/dashboard',   icon: <LayoutDashboard className="w-4 h-4" />, label: 'Command Center' },
  { href: '/hospital/wards',       icon: <BedDouble       className="w-4 h-4" />, label: 'Wards & Beds' },
  { href: '/hospital/admissions',  icon: <ClipboardPlus   className="w-4 h-4" />, label: 'Admissions' },
  { href: '/hospital/staff',       icon: <Users           className="w-4 h-4" />, label: 'Staff Management' },
];

export default function HospitalAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      roleLabel="Hospital Portal"
    >
      {children}
    </SidebarLayout>
  );
}
