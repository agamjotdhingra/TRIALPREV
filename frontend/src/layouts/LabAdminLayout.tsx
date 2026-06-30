import { SidebarLayout } from './SidebarLayout';
import type { ReactNode } from 'react';
import {
  LayoutDashboard,
  Search,
  Upload,
  FileText,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/lab/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { href: '/lab/search',    icon: <Search          className="w-4 h-4" />, label: 'Search Patient' },
  { href: '/lab/upload',    icon: <Upload          className="w-4 h-4" />, label: 'Upload Report' },
  { href: '/lab/reports',   icon: <FileText        className="w-4 h-4" />, label: 'My Reports' },
];

export default function LabAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout
      navItems={NAV_ITEMS}
      roleLabel="Lab Portal"
    >
      {children}
    </SidebarLayout>
  );
}
