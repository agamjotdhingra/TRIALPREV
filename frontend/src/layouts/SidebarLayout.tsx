import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/auth/AuthContext';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

interface SidebarLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  brandColor: string;      // tailwind color class e.g. 'blue'
  roleLabel: string;
  roleIcon: string;
}

export function SidebarLayout({ children, navItems, brandColor, roleLabel, roleIcon }: SidebarLayoutProps) {
  const { profile, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const colorMap: Record<string, string> = {
    blue:    'bg-blue-600 shadow-blue-500/20',
    emerald: 'bg-emerald-600 shadow-emerald-500/20',
    violet:  'bg-violet-600 shadow-violet-500/20',
    amber:   'bg-amber-600 shadow-amber-500/20',
    rose:    'bg-rose-600 shadow-rose-500/20',
  };
  const activeMap: Record<string, string> = {
    blue:    'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-r-2 border-emerald-500',
    violet:  'bg-violet-600/20 text-violet-400 border-r-2 border-violet-500',
    amber:   'bg-amber-600/20 text-amber-400 border-r-2 border-amber-500',
    rose:    'bg-rose-600/20 text-rose-400 border-r-2 border-rose-500',
  };

  const brandBg = colorMap[brandColor] || colorMap.blue;
  const activeCls = activeMap[brandColor] || activeMap.blue;

  const Sidebar = () => (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${brandBg} shadow-lg flex items-center justify-center text-white font-bold text-lg`}>
            {roleIcon}
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">HealthOS</p>
            <p className="text-slate-400 text-xs mt-0.5">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-semibold">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.full_name}</p>
            <p className="text-slate-400 text-xs capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? activeCls
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="text-slate-400 hover:text-white relative">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
