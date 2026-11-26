import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Bell, ChevronDown, CircleHelp, LogOut, Menu, Settings, Sparkles, User, X } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { Avatar, IconBtn, Logo } from '@/components/kit';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: string;
  /** Extra path prefixes that should mark this tab active. */
  match?: string[];
  children?: { label: string; href: string; description?: string }[];
}

export interface ShellConfig {
  nav: NavItem[];
  roleLabel: string;
  profileHref?: string;
  notificationsHref?: string;
  notifications?: { title: string; time: string }[];
}

function isActive(location: string, item: NavItem) {
  const prefixes = [item.href, ...(item.match ?? []), ...(item.children?.map((c) => c.href) ?? [])];
  return prefixes.some((p) => location === p || location.startsWith(p + '/'));
}

const menuItemCls =
  'flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-2 outline-none transition-colors data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-800';
const menuContentCls =
  'z-50 min-w-[220px] rounded-2xl border border-line-soft bg-white p-1.5 shadow-lift data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95';

export function AppShell({ config, children }: { config: ShellConfig; children: ReactNode }) {
  const { profile, signOut, isDemo } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  }, [location]);

  const notifs = config.notifications ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {isDemo && (
        <div className="bg-brand-900 px-4 py-1.5 text-center text-xs font-medium text-brand-100">
          <Sparkles className="mr-1.5 inline size-3.5 -translate-y-px" />
          You're exploring Prevntiv with sample data.{' '}
          <button
            className="font-semibold text-white underline underline-offset-2 hover:text-brand-200"
            onClick={async () => {
              await signOut();
              setLocation('/role');
            }}
          >
            Switch role or exit demo
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-line-soft bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button className="-ml-1 rounded-lg p-2 text-ink-2 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <Link href={config.nav[0]?.href ?? '/'} className="shrink-0" aria-label="Prevntiv home">
            <Logo />
          </Link>

          <nav className="mx-auto hidden items-center gap-1 rounded-full border border-line-soft bg-slate-50/80 p-1 lg:flex" aria-label="Main">
            {config.nav.map((item) => {
              const active = isActive(location, item);
              const cls = cn(
                'inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200',
                active ? 'bg-white text-brand-700 shadow-sm ring-1 ring-line-soft' : 'text-ink-3 hover:text-ink',
              );
              if (!item.children) {
                return (
                  <Link key={item.href} href={item.href} className={cls} aria-current={active ? 'page' : undefined}>
                    {item.label}
                  </Link>
                );
              }
              return (
                <DropdownMenu.Root key={item.href} modal={false}>
                  <DropdownMenu.Trigger className={cn(cls, 'outline-none')}>
                    {item.label}
                    <ChevronDown className="size-3.5 opacity-70" />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content align="start" sideOffset={10} className={cn(menuContentCls, 'w-72')}>
                      {item.children.map((c) => (
                        <DropdownMenu.Item key={c.href} className={menuItemCls} onSelect={() => setLocation(c.href)}>
                          <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', location.startsWith(c.href) ? 'bg-brand-500' : 'bg-slate-300')} />
                          <span>
                            <span className="block font-semibold text-ink">{c.label}</span>
                            {c.description && <span className="block text-xs text-ink-3">{c.description}</span>}
                          </span>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
            <IconBtn label="Help" className="hidden sm:inline-flex" onClick={() => window.open('mailto:support@prevntiv.in')}>
              <CircleHelp className="size-[18px]" />
            </IconBtn>
            <IconBtn label="Settings" className="hidden sm:inline-flex" onClick={() => config.profileHref && setLocation(config.profileHref)}>
              <Settings className="size-[18px]" />
            </IconBtn>

            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <IconBtn label="Notifications" badge={notifs.length > 0}>
                  <Bell className="size-[18px]" />
                </IconBtn>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={10} className={cn(menuContentCls, 'w-80')}>
                  <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-ink-4">Notifications</p>
                  {notifs.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-3">You're all caught up.</p>}
                  {notifs.map((n, i) => (
                    <DropdownMenu.Item key={i} className={menuItemCls} onSelect={() => config.notificationsHref && setLocation(config.notificationsHref)}>
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />
                      <span>
                        <span className="block font-medium text-ink">{n.title}</span>
                        <span className="block text-xs text-ink-3">{n.time}</span>
                      </span>
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger className="ml-1.5 flex items-center gap-2 rounded-full p-0.5 pr-2 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500">
                <Avatar name={profile?.full_name} size={32} />
                <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-ink xl:block">{profile?.full_name}</span>
                <ChevronDown className="hidden size-3.5 text-ink-3 xl:block" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={10} className={menuContentCls}>
                  <div className="px-3 pb-2 pt-2.5">
                    <p className="text-sm font-semibold text-ink">{profile?.full_name}</p>
                    <p className="text-xs text-ink-3">{config.roleLabel}</p>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-line-soft" />
                  {config.profileHref && (
                    <DropdownMenu.Item className={menuItemCls} onSelect={() => setLocation(config.profileHref!)}>
                      <User className="mt-0.5 size-4" /> My profile
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item
                    className={cn(menuItemCls, 'data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700')}
                    onSelect={async () => {
                      await signOut();
                      setLocation(isDemo ? '/role' : '/welcome');
                    }}
                  >
                    <LogOut className="mt-0.5 size-4" /> {isDemo ? 'Exit demo' : 'Sign out'}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-0" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white shadow-2xl animate-in slide-in-from-left">
            <div className="flex h-16 items-center justify-between border-b border-line-soft px-5">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-ink-3 hover:bg-slate-100" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {config.nav.map((item) => (
                <div key={item.href} className="mb-1">
                  <Link
                    href={item.children ? item.children[0].href : item.href}
                    className={cn('block rounded-xl px-4 py-2.5 text-sm font-semibold', isActive(location, item) ? 'bg-brand-50 text-brand-800' : 'text-ink-2 hover:bg-slate-50')}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="ml-4 border-l border-line-soft pl-2">
                      {item.children.map((c) => (
                        <Link key={c.href} href={c.href} className={cn('block rounded-lg px-3 py-2 text-[13px]', location.startsWith(c.href) ? 'font-semibold text-brand-700' : 'text-ink-3 hover:text-ink')}>
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            <div className="border-t border-line-soft p-4">
              <div className="flex items-center gap-3">
                <Avatar name={profile?.full_name} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{profile?.full_name}</p>
                  <p className="text-xs text-ink-3">{config.roleLabel}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-line-soft bg-white/60', className)}>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-ink-3 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span>© 2026 Prevntiv India. All rights reserved.</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {['Privacy Policy', 'Terms of Service', 'Security', 'Contact Support'].map((l) => (
            <a key={l} href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-brand-700">
              {l}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
