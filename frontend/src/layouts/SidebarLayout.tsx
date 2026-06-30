import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/auth/AuthContext';
import { Bell, LogOut, Menu, Leaf } from 'lucide-react';
import { useState } from 'react';

// Colours — medium fresh green (not too dark, not too light)
const G = {
  sidebar:      'hsl(152 42% 22%)',
  sidebarDark:  'hsl(152 40% 17%)',
  sidebarLight: 'hsl(152 40% 28%)',
  active:       'hsl(152 50% 36%)',
  activeBorder: 'hsl(152 55% 60%)',
  activeBg:     'hsl(152 48% 32% / 0.85)',
  hover:        'hsl(152 40% 28% / 0.55)',
  iconMuted:    'hsl(152 35% 72%)',
  textMuted:    'hsl(152 28% 68%)',
  subtext:      'hsl(152 30% 58%)',
  border:       'hsl(152 35% 18%)',
  avatarGrad:   'linear-gradient(135deg, hsl(152 55% 42%) 0%, hsl(162 55% 48%) 100%)',
  primary:      'hsl(152 55% 42%)',
};

interface NavItem {
  href: string;
  icon: ReactNode;   // Lucide component
  label: string;
}

interface SidebarLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  brandColor?: string;
  roleLabel: string;
  roleIcon?: ReactNode;
}

export function SidebarLayout({ children, navItems, roleLabel }: SidebarLayoutProps) {
  const { profile, signOut } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = () => (
    <aside
      className="w-64 flex flex-col h-full select-none"
      style={{ background: `linear-gradient(180deg, ${G.sidebar} 0%, ${G.sidebarDark} 100%)` }}
    >
      {/* ── Brand ── */}
      <div className="px-5 py-5" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{ background: G.avatarGrad }}
          >
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-base leading-none tracking-tight">preventiv</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: G.subtext }}>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* ── User info ── */}
      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ background: 'hsl(152 40% 28% / 0.4)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: G.avatarGrad }}
          >
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-tight">{profile?.full_name}</p>
            <p className="text-xs capitalize leading-tight mt-0.5" style={{ color: G.textMuted }}>
              {profile?.role?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <a
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group"
                style={isActive ? {
                  background: G.activeBg,
                  color: '#fff',
                  borderLeft: `3px solid ${G.activeBorder}`,
                  paddingLeft: '9px',
                } : {
                  color: G.iconMuted,
                  borderLeft: '3px solid transparent',
                  paddingLeft: '9px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = G.hover;
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = G.iconMuted;
                  }
                }}
                onClick={() => setMobileOpen(false)}
              >
                {/* Icon */}
                <span
                  className="flex-shrink-0 w-4 h-4 flex items-center justify-center"
                  style={{ color: isActive ? '#fff' : G.iconMuted }}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* ── Sign out ── */}
      <div className="p-4" style={{ borderTop: `1px solid ${G.border}` }}>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: G.textMuted, borderLeft: '3px solid transparent', paddingLeft: '9px' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = 'hsl(4 86% 72%)';
            (e.currentTarget as HTMLElement).style.background = 'hsl(4 86% 58% / 0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = G.textMuted;
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(150 25% 97%)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="h-14 flex items-center px-5 gap-4 flex-shrink-0"
          style={{
            background: '#fff',
            borderBottom: '1px solid hsl(150 30% 90%)',
            boxShadow: '0 1px 6px hsl(152 30% 50% / 0.06)',
          }}
        >
          <button
            className="lg:hidden"
            style={{ color: 'hsl(152 18% 48%)' }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: G.avatarGrad }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base" style={{ color: G.sidebar }}>preventiv</span>
          </div>

          <div className="flex-1" />

          {/* Bell */}
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: G.active }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'hsl(152 50% 93%)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Bell className="w-4.5 h-4.5" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
              style={{ background: 'hsl(152 55% 42%)' }}
            />
          </button>

          {/* Avatar chip */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer"
            style={{
              background: 'hsl(152 45% 95%)',
              border: '1px solid hsl(152 35% 86%)',
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: G.avatarGrad }}
            >
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="hidden sm:block text-sm font-semibold" style={{ color: G.sidebar }}>
              {profile?.full_name?.split(' ')[0]}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" style={{ background: 'hsl(150 25% 97%)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
