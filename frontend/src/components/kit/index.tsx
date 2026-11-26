/**
 * Prevntiv UI kit — shared building blocks derived from the Figma design system.
 * Light canvas (#F7F9FB), white elevated cards, deep emerald primary, mint accents,
 * Plus Jakarta Sans display type over Inter body copy.
 */
import * as React from 'react';
import { Link } from 'wouter';
import * as Dialog from '@radix-ui/react-dialog';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Loader2, Search, UploadCloud, X, ArrowLeft, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ───────────────────────── Brand ───────────────────────── */

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('shrink-0', className)} aria-hidden>
      <path d="M8.5 2h7v6.5H22v7h-6.5V22h-7v-6.5H2v-7h6.5z" fill="currentColor" />
      <path d="M10.5 10.5h3v3h-3z" fill="#fff" opacity=".9" />
    </svg>
  );
}

export function Logo({ className, size = 'md', withText = true }: { className?: string; size?: 'sm' | 'md' | 'lg'; withText?: boolean }) {
  const s = { sm: 'h-4', md: 'h-5', lg: 'h-7' }[size];
  const t = { sm: 'text-[13px]', md: 'text-base', lg: 'text-2xl' }[size];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-brand-500', className)} aria-label="Prevntiv">
      <LogoMark className={cn(s, 'w-auto aspect-square')} />
      {withText && <span className={cn('font-display font-extrabold italic tracking-tight uppercase text-brand-700', t)}>Prevntiv</span>}
    </span>
  );
}

/* ───────────────────────── Buttons ───────────────────────── */

type BtnVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'danger-soft' | 'link';
type BtnSize = 'xs' | 'sm' | 'md' | 'lg';

const btnBase =
  'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';
const btnVariants: Record<BtnVariant, string> = {
  primary: 'btn-gradient text-white shadow-[0_6px_16px_-6px_rgb(0_107_69/0.55)] hover:brightness-110 hover:shadow-[0_10px_24px_-8px_rgb(0_107_69/0.6)]',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-100',
  outline: 'bg-white text-ink-2 border border-line hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50/40',
  ghost: 'text-ink-2 hover:bg-slate-100 hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-[0_6px_16px_-6px_rgb(220_38_38/0.5)]',
  'danger-soft': 'bg-red-50 text-red-700 border border-red-100 hover:bg-red-100',
  link: 'text-brand-700 hover:text-brand-500 underline-offset-4 hover:underline px-0! h-auto!',
};
const btnSizes: Record<BtnSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
};

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  shape?: 'pill' | 'rounded';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  href?: string;
  block?: boolean;
}

export const Btn = React.forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  { variant = 'primary', size = 'md', shape = 'pill', loading, icon, iconRight, href, block, className, children, disabled, ...rest },
  ref,
) {
  const cls = cn(btnBase, btnVariants[variant], btnSizes[size], shape === 'pill' ? 'rounded-full' : 'rounded-xl', block && 'w-full', className);
  const content = (
    <>
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
      {!loading && iconRight}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
});

export function IconBtn({ className, label, children, badge, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; badge?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn('relative inline-flex size-9 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-slate-100 hover:text-ink', className)}
      {...rest}
    >
      {children}
      {badge && <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />}
    </button>
  );
}

/* ───────────────────────── Surfaces ───────────────────────── */

export function Card({ className, children, as: As = 'div', ...rest }: React.HTMLAttributes<HTMLDivElement> & { as?: any }) {
  return (
    <As className={cn('card', className)} {...rest}>
      {children}
    </As>
  );
}

export function CardHeader({ title, subtitle, action, icon, className }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[13px] text-ink-3">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, back, eyebrow, className }: { title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label?: string }; eyebrow?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-6 sm:mb-8', className)}>
      {back && (
        <Link href={back.href} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-3 transition-colors hover:text-brand-700">
          <ArrowLeft className="size-4" /> {back.label ?? 'Back'}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-600">{eyebrow}</p>}
          <h1 className="text-2xl font-bold text-ink sm:text-[28px] sm:leading-9">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-3">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </div>
  );
}

export function Page({ children, className, width = 'xl' }: { children: React.ReactNode; className?: string; width?: 'md' | 'lg' | 'xl' | 'full' }) {
  const w = { md: 'max-w-3xl', lg: 'max-w-5xl', xl: 'max-w-7xl', full: 'max-w-[1440px]' }[width];
  return <div className={cn('mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 animate-fade-up', w, className)}>{children}</div>;
}

/* ───────────────────────── Status & badges ───────────────────────── */

export type Tone = 'green' | 'mint' | 'amber' | 'red' | 'blue' | 'gray' | 'violet' | 'orange';
const toneCls: Record<Tone, string> = {
  green: 'bg-brand-50 text-brand-700 ring-brand-100',
  mint: 'bg-brand-100 text-brand-800 ring-brand-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  blue: 'bg-sky-50 text-sky-700 ring-sky-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  gray: 'bg-slate-100 text-slate-600 ring-slate-200',
};
const dotCls: Record<Tone, string> = {
  green: 'bg-brand-500', mint: 'bg-brand-600', amber: 'bg-amber-500', orange: 'bg-orange-500', red: 'bg-red-500', blue: 'bg-sky-500', violet: 'bg-violet-500', gray: 'bg-slate-400',
};

export function Badge({ tone = 'gray', dot, children, className, upper }: { tone?: Tone; dot?: boolean; children: React.ReactNode; className?: string; upper?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', toneCls[tone], upper && 'uppercase tracking-wide text-[10.5px]', className)}>
      {dot && <span className={cn('size-1.5 rounded-full', dotCls[tone])} />}
      {children}
    </span>
  );
}

/** Maps any status / risk keyword used across the platform to a tone. */
export function toneFor(value?: string | null): Tone {
  const v = (value ?? '').toLowerCase();
  if (/(critical|cancel|denied|reject|revoked|deleted|overdue|failed|elevated|urgent)/.test(v)) return 'red';
  if (/(high|warning|pending|review|leave|maintenance|observation|expiring|moderate|medium|unread|due)/.test(v))
    return /high/.test(v) ? 'orange' : 'amber';
  if (/(scheduled|in-person|upcoming|video|tele|icu|in progress|downloaded)/.test(v)) return 'blue';
  if (/(normal|healthy|completed|active|approved|admitted|available|paid|low|good|finalized|verified|recovery|cleared|optimal|read|viewed)/.test(v)) return 'green';
  return 'gray';
}

export function StatusPill({ status, className }: { status?: string | null; className?: string }) {
  if (!status) return <span className="text-ink-4">—</span>;
  return (
    <Badge tone={toneFor(status)} dot className={cn('capitalize', className)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

export function Chip({ selected, onClick, children, onRemove, className, size = 'md' }: { selected?: boolean; onClick?: () => void; children: React.ReactNode; onRemove?: () => void; className?: string; size?: 'sm' | 'md' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-all duration-150',
        size === 'sm' ? 'h-7 px-3 text-xs' : 'h-9 px-4 text-[13px]',
        selected
          ? 'border-brand-400 bg-brand-100 text-brand-800 shadow-[0_0_0_3px_rgb(52_195_143/0.12)]'
          : 'border-line bg-white text-ink-2 hover:border-brand-300 hover:text-brand-700',
        className,
      )}
    >
      {children}
      {selected && onRemove && (
        <X
          className="size-3.5"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </button>
  );
}

export function ChipGroup<T extends string>({ options, value, onChange, multiple = true, allowCustom, customLabel = 'Add Custom' }: { options: T[]; value: T[]; onChange: (v: T[]) => void; multiple?: boolean; allowCustom?: boolean; customLabel?: string }) {
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const all = Array.from(new Set([...options, ...value]));
  const toggle = (o: T) => {
    if (o.toLowerCase() === 'none') return onChange(value.includes(o) ? [] : [o]);
    const base = value.filter((x) => x.toLowerCase() !== 'none');
    if (!multiple) return onChange(value.includes(o) ? [] : [o]);
    onChange(base.includes(o) ? base.filter((x) => x !== o) : [...base, o]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((o) => (
        <Chip key={o} selected={value.includes(o)} onClick={() => toggle(o)}>
          {o}
          {value.includes(o) && <X className="size-3.5 opacity-60" />}
        </Chip>
      ))}
      {allowCustom &&
        (adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              if (draft.trim()) onChange([...value, draft.trim() as T]);
              setDraft('');
              setAdding(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') {
                setDraft('');
                setAdding(false);
              }
            }}
            placeholder="Type & press Enter"
            className="h-9 w-44 rounded-full border border-brand-300 bg-white px-4 text-[13px] outline-none ring-4 ring-brand-100"
          />
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="h-9 rounded-full border border-dashed border-line px-4 text-[13px] font-medium text-ink-3 transition-colors hover:border-brand-400 hover:text-brand-700">
            + {customLabel}
          </button>
        ))}
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange, className, size = 'md' }: { options: (T | { value: T; label: React.ReactNode })[]; value: T; onChange: (v: T) => void; className?: string; size?: 'sm' | 'md' }) {
  return (
    <div role="radiogroup" className={cn('inline-flex w-full rounded-xl bg-slate-100 p-1', className)}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              'flex-1 rounded-lg font-medium transition-all duration-200',
              size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-[13px]',
              active ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-3 hover:text-ink',
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function CapsuleTabs<T extends string>({ tabs, value, onChange, className }: { tabs: (T | { value: T; label: React.ReactNode; count?: number })[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-line-soft bg-white p-1 shadow-card scrollbar-thin', className)}>
      {tabs.map((t) => {
        const v = typeof t === 'string' ? t : t.value;
        const l = typeof t === 'string' ? t : t.label;
        const c = typeof t === 'string' ? undefined : t.count;
        const active = v === value;
        return (
          <button
            key={v}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200',
              active ? 'bg-brand-700 text-white shadow-sm' : 'text-ink-3 hover:bg-slate-50 hover:text-ink',
            )}
          >
            {l}
            {c !== undefined && <span className={cn('rounded-full px-1.5 text-[11px]', active ? 'bg-white/20' : 'bg-slate-100')}>{c}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Form controls ───────────────────────── */

export function Field({ label, hint, error, required, children, className, aside, htmlFor }: { label?: React.ReactNode; hint?: React.ReactNode; error?: string | false | null; required?: boolean; children: React.ReactNode; className?: string; aside?: React.ReactNode; htmlFor?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
          {aside}
        </div>
      )}
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : hint ? <p className="text-xs text-ink-3">{hint}</p> : null}
    </div>
  );
}

export const inputCls =
  'w-full h-11 rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-ink-4 outline-none transition-all duration-150 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 disabled:bg-slate-50 disabled:text-ink-3 read-only:bg-slate-50 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-500/10';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; leftIcon?: React.ReactNode; right?: React.ReactNode }>(
  function Input({ className, invalid, leftIcon, right, ...rest }, ref) {
    if (!leftIcon && !right) return <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputCls, className)} {...rest} />;
    return (
      <div className="relative">
        {leftIcon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4 [&_svg]:size-4">{leftIcon}</span>}
        <input ref={ref} aria-invalid={invalid || undefined} className={cn(inputCls, leftIcon && 'pl-10', right && 'pr-24', className)} {...rest} />
        {right && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</span>}
      </div>
    );
  },
);

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(inputCls, 'h-auto min-h-[110px] resize-y py-3 leading-relaxed', className)} {...rest} />;
});

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string; options?: (string | { value: string; label: string })[] }>(
  function Select({ className, placeholder, options, children, ...rest }, ref) {
    return (
      <div className="relative">
        <select ref={ref} className={cn(inputCls, 'appearance-none pr-10', !rest.value && placeholder && 'text-ink-4', className)} {...rest}>
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
      </div>
    );
  },
);

/** Unit toggle that sits inside an input (cm/ft, kg/lbs). */
export function UnitToggle<T extends string>({ units, value, onChange }: { units: T[]; value: T; onChange: (u: T) => void }) {
  return (
    <span className="flex overflow-hidden rounded-lg border border-line text-xs font-semibold">
      {units.map((u) => (
        <button key={u} type="button" onClick={() => onChange(u)} className={cn('px-2.5 py-1.5 transition-colors', u === value ? 'bg-brand-100 text-brand-700' : 'bg-white text-ink-3 hover:text-ink')}>
          {u}
        </button>
      ))}
    </span>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-4" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(inputCls, 'h-10 pl-10 pr-9')} />
      {value && (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-4 hover:bg-slate-100 hover:text-ink">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export function Checkbox({ checked, onChange, label, description, round, className }: { checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; description?: React.ReactNode; round?: boolean; className?: string }) {
  return (
    <label className={cn('group flex cursor-pointer items-start gap-3', className)}>
      <span
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className={cn(
          'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center border-2 transition-all',
          round ? 'rounded-full' : 'rounded-md',
          checked ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300 bg-white group-hover:border-brand-400',
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      {(label || description) && (
        <span className="min-w-0" onClick={() => onChange(!checked)}>
          {label && <span className="block text-sm font-medium text-ink">{label}</span>}
          {description && <span className="block text-xs text-ink-3">{description}</span>}
        </span>
      )}
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onChange}
      aria-label={label}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-slate-200 transition-colors data-[state=checked]:bg-brand-600"
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}

export function OtpInput({ length = 6, value, onChange, invalid }: { length?: number; value: string; onChange: (v: string) => void; invalid?: boolean }) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(length).split('').slice(0, length);
  const setAt = (i: number, c: string) => {
    const next = chars.map((x, j) => (j === i ? c : x)).join('').replace(/\s+$/, '');
    onChange(next);
  };
  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={(e) => {
      const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (t) {
        e.preventDefault();
        onChange(t);
        refs.current[Math.min(t.length, length - 1)]?.focus();
      }
    }}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          value={c.trim()}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1);
            setAt(i, d || ' ');
            if (d && i < length - 1) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !c.trim() && i > 0) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
            if (e.key === 'ArrowRight' && i < length - 1) refs.current[i + 1]?.focus();
          }}
          className={cn(
            'size-11 sm:size-12 rounded-xl border bg-white text-center font-display text-xl font-bold text-ink outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15',
            invalid ? 'border-red-400' : c.trim() ? 'border-brand-300' : 'border-line',
          )}
        />
      ))}
    </div>
  );
}

export function UploadZone({ onFiles, accept, title = 'Click to upload or drag and drop', hint, compact, multiple }: { onFiles: (files: File[]) => void; accept?: string; title?: string; hint?: string; compact?: boolean; multiple?: boolean }) {
  const [drag, setDrag] = React.useState(false);
  const ref = React.useRef<HTMLInputElement>(null);
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && ref.current?.click()}
      onClick={() => ref.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files.length) onFiles(Array.from(e.dataTransfer.files));
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-all',
        compact ? 'px-4 py-5' : 'px-6 py-10',
        drag ? 'border-brand-500 bg-brand-50' : 'border-line bg-slate-50/60 hover:border-brand-300 hover:bg-brand-50/50',
      )}
    >
      <span className={cn('inline-flex items-center justify-center rounded-full bg-white text-brand-600 shadow-card', compact ? 'size-10' : 'size-12')}>
        <UploadCloud className={compact ? 'size-5' : 'size-6'} />
      </span>
      <p className="text-sm font-semibold text-ink">
        <span className="text-brand-700">{title.split(' or ')[0]}</span>
        {title.includes(' or ') && <span className="font-medium text-ink-2"> or {title.split(' or ')[1]}</span>}
      </p>
      {hint && <p className="text-xs text-ink-3">{hint}</p>}
      <input
        ref={ref}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files?.length) onFiles(Array.from(e.target.files));
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ───────────────────────── Identity ───────────────────────── */

const avatarTones = ['bg-brand-100 text-brand-800', 'bg-sky-100 text-sky-800', 'bg-amber-100 text-amber-800', 'bg-violet-100 text-violet-800', 'bg-rose-100 text-rose-800', 'bg-teal-100 text-teal-800'];
export function initials(name?: string | null) {
  if (!name) return '?';
  const parts = name.replace(/^(dr\.?|mr\.?|mrs\.?|ms\.?)\s+/i, '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
export function Avatar({ name, src, size = 40, className, ring }: { name?: string | null; src?: string; size?: number; className?: string; ring?: boolean }) {
  const tone = avatarTones[(name ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-bold', tone, ring && 'ring-4 ring-white shadow-card', className)}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {src ? <img src={src} alt={name ?? ''} className="size-full object-cover" /> : initials(name)}
    </span>
  );
}

export function Person({ name, sub, size = 36, src, trailing }: { name: React.ReactNode; sub?: React.ReactNode; size?: number; src?: string; trailing?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={typeof name === 'string' ? name : undefined} size={size} src={src} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        {sub && <p className="truncate text-xs text-ink-3">{sub}</p>}
      </div>
      {trailing}
    </div>
  );
}

/* ───────────────────────── Data display ───────────────────────── */

export function Kpi({ label, value, unit, sub, badge, icon, className, tone = 'default', onClick }: { label: React.ReactNode; value: React.ReactNode; unit?: React.ReactNode; sub?: React.ReactNode; badge?: React.ReactNode; icon?: React.ReactNode; className?: string; tone?: 'default' | 'hero' | 'danger'; onClick?: () => void }) {
  const hero = tone === 'hero';
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 transition-all',
        hero ? 'btn-gradient text-white shadow-lift' : 'card',
        tone === 'danger' && 'border-red-100 bg-gradient-to-br from-white to-red-50/60',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn('text-[13px] font-medium', hero ? 'text-white/80' : 'text-ink-3')}>{label}</p>
        {icon && <span className={cn('inline-flex size-9 items-center justify-center rounded-xl [&_svg]:size-[18px]', hero ? 'bg-white/15 text-white' : tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700')}>{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={cn('font-display text-[28px] font-bold leading-none num', hero ? 'text-white' : 'text-ink')}>{value}</span>
        {unit && <span className={cn('text-sm font-medium', hero ? 'text-white/75' : 'text-ink-3')}>{unit}</span>}
        {badge && <span className="ml-1">{badge}</span>}
      </div>
      {sub && <p className={cn('mt-2 text-xs', hero ? 'text-white/75' : 'text-ink-3')}>{sub}</p>}
    </div>
  );
}

export function Donut({ segments, size = 140, thickness = 16, children, className }: { segments: { value: number; color: string; label?: string }[]; size?: number; thickness?: number; children?: React.ReactNode; className?: string }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  return (
    <div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f6" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-offset} strokeLinecap="round">
              <title>{s.label}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function ScoreRing({ score, size = 140, label = 'SCORE', thickness = 12 }: { score: number; size?: number; label?: string; thickness?: number }) {
  const color = score >= 80 ? '#029c6b' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';
  return (
    <Donut size={size} thickness={thickness} segments={[{ value: score, color }, { value: 100 - score, color: 'transparent' }]}>
      <span className="font-display font-extrabold text-ink num" style={{ fontSize: size * 0.28, lineHeight: 1 }}>
        {score}
      </span>
      <span className="mt-1 text-[10px] font-bold tracking-[0.14em] text-ink-3">{label}</span>
    </Donut>
  );
}

export function Progress({ value, tone, className, height = 8 }: { value: number; tone?: Tone; className?: string; height?: number }) {
  const t = tone ?? (value >= 90 ? 'red' : value >= 75 ? 'amber' : 'green');
  const bar = { red: 'bg-red-500', amber: 'bg-amber-500', orange: 'bg-orange-500', green: 'bg-brand-500', mint: 'bg-brand-400', blue: 'bg-sky-500', gray: 'bg-slate-400', violet: 'bg-violet-500' }[t];
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-slate-100', className)} style={{ height }}>
      <div className={cn('h-full rounded-full transition-[width] duration-700', bar)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Stepper({ steps, current, className, variant = 'numbered' }: { steps: string[]; current: number; className?: string; variant?: 'numbered' | 'compact' }) {
  return (
    <ol className={cn('flex w-full items-start', className)}>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="relative flex flex-1 flex-col items-center gap-2 text-center">
            {i > 0 && <span className={cn('absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2', done || active ? 'bg-brand-700' : 'bg-slate-200')} style={{ marginRight: 18, width: 'calc(100% - 36px)' }} />}
            <span
              className={cn(
                'relative z-10 inline-flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                done && 'bg-brand-700 text-white',
                active && 'bg-brand-700 text-white ring-4 ring-brand-100',
                !done && !active && 'bg-slate-100 text-ink-3',
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
            </span>
            {variant === 'numbered' && <span className={cn('hidden text-[11px] font-semibold sm:block', active ? 'text-brand-700' : done ? 'text-ink-2' : 'text-ink-4')}>{s}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function StepDots({ total, current, label }: { total: number; current: number; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-6 bg-brand-600' : i < current ? 'w-1.5 bg-brand-300' : 'w-1.5 bg-slate-200')} />
        ))}
      </div>
      <span className="text-xs font-semibold text-ink-3">{label ?? `Step ${current + 1} of ${total}`}</span>
    </div>
  );
}

/* ───────────────────────── Tables ───────────────────────── */

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  align?: 'left' | 'right' | 'center';
}

export function DataTable<T>({ columns, rows, rowKey, loading, empty, onRowClick, className, rowClassName }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T, i: number) => React.Key; loading?: boolean; empty?: React.ReactNode; onRowClick?: (r: T) => void; className?: string; rowClassName?: (r: T) => string | undefined }) {
  return (
    <div className={cn('overflow-x-auto scrollbar-thin', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-soft bg-slate-50/70">
            {columns.map((c) => (
              <th key={c.key} className={cn('whitespace-nowrap px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.hideOnMobile && 'hidden md:table-cell', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-5 py-4', c.hideOnMobile && 'hidden md:table-cell')}>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((r, i) => (
                <tr
                  key={rowKey(r, i)}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  className={cn('group transition-colors hover:bg-brand-50/40', onRowClick && 'cursor-pointer', rowClassName?.(r))}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn('px-5 py-4 align-middle text-ink-2', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.hideOnMobile && 'hidden md:table-cell', c.className)}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
      {!loading && rows.length === 0 && (empty ?? <EmptyState title="Nothing here yet" description="Try adjusting your search or filters." />)}
    </div>
  );
}

export function Pagination({ page, pageSize, total, onPage, noun = 'entries' }: { page: number; pageSize: number; total: number; onPage: (p: number) => void; noun?: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line-soft px-5 py-4 text-[13px] text-ink-3 sm:flex-row">
      <span>
        Showing <b className="font-semibold text-ink-2">{from}</b> to <b className="font-semibold text-ink-2">{to}</b> of <b className="font-semibold text-ink-2">{total}</b> {noun}
      </span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 font-medium transition-colors hover:bg-slate-100 disabled:opacity-40">
          <ChevronLeft className="size-4" /> Previous
        </button>
        {nums.map((n, i) => (
          <React.Fragment key={n}>
            {i > 0 && n - nums[i - 1] > 1 && <span className="px-1">…</span>}
            <button onClick={() => onPage(n)} className={cn('size-8 rounded-lg font-semibold transition-colors', n === page ? 'bg-brand-700 text-white' : 'hover:bg-slate-100')}>
              {n}
            </button>
          </React.Fragment>
        ))}
        <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 font-medium transition-colors hover:bg-slate-100 disabled:opacity-40">
          Next <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

/** Client-side pagination helper. */
export function usePaged<T>(rows: T[], pageSize = 8) {
  const [page, setPage] = React.useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  React.useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages, page]);
  return { page, setPage, slice: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, pageSize };
}

export function EmptyState({ icon, title, description, action, className }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <span className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 [&_svg]:size-6">{icon ?? <Inbox />}</span>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-3">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-100', className)} />;
}

export function InfoRow({ label, value, className }: { label: React.ReactNode; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-4">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-ink">{value ?? '—'}</p>
    </div>
  );
}

export function Callout({ tone = 'green', icon, title, children, className }: { tone?: 'green' | 'amber' | 'red' | 'blue'; icon?: React.ReactNode; title?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  const t = { green: 'bg-brand-50 border-brand-100 text-brand-900', amber: 'bg-amber-50 border-amber-100 text-amber-900', red: 'bg-red-50 border-red-100 text-red-900', blue: 'bg-sky-50 border-sky-100 text-sky-900' }[tone];
  const ic = { green: 'text-brand-600', amber: 'text-amber-600', red: 'text-red-600', blue: 'text-sky-600' }[tone];
  return (
    <div className={cn('flex gap-3 rounded-xl border p-4', t, className)}>
      {icon && <span className={cn('mt-0.5 shrink-0 [&_svg]:size-[18px]', ic)}>{icon}</span>}
      <div className="min-w-0 text-[13px] leading-relaxed">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}

/* ───────────────────────── Overlays ───────────────────────── */

export function Modal({ open, onClose, title, description, children, footer, size = 'md', icon }: { open: boolean; onClose: () => void; title: React.ReactNode; description?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; size?: 'sm' | 'md' | 'lg'; icon?: React.ReactNode }) {
  const w = { sm: 'max-w-[440px]', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl outline-none sm:p-7',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            w,
          )}
        >
          <div className={cn(icon && 'text-center')}>
            {icon && <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full">{icon}</div>}
            <Dialog.Title className="font-display text-lg font-bold text-ink">{title}</Dialog.Title>
            {description ? <Dialog.Description className="mt-1.5 text-sm text-ink-3">{description}</Dialog.Description> : <Dialog.Description className="sr-only">Dialog</Dialog.Description>}
          </div>
          {children && <div className="mt-5">{children}</div>}
          {footer && <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">{footer}</div>}
          <Dialog.Close className="absolute right-4 top-4 rounded-full p-1.5 text-ink-4 transition-colors hover:bg-slate-100 hover:text-ink" aria-label="Close">
            <X className="size-4" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Drawer({ open, onClose, title, children, footer, subtitle }: { open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          <div className="flex items-start justify-between gap-4 border-b border-line-soft px-6 py-5">
            <div>
              <Dialog.Title className="font-display text-lg font-bold text-ink">{title}</Dialog.Title>
              <Dialog.Description className={cn('mt-0.5 text-sm text-ink-3', !subtitle && 'sr-only')}>{subtitle ?? 'Details'}</Dialog.Description>
            </div>
            <Dialog.Close className="rounded-full p-1.5 text-ink-4 hover:bg-slate-100 hover:text-ink" aria-label="Close">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex justify-end gap-2.5 border-t border-line-soft px-6 py-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ───────────────────────── Misc helpers ───────────────────────── */

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (!label) return <hr className={cn('border-line-soft', className)} />;
  return (
    <div className={cn('flex items-center gap-3 text-xs font-medium text-ink-4', className)}>
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function SectionTitle({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-3', className)}>
      <h3 className="font-display text-base font-bold text-ink">{children}</h3>
      {action}
    </div>
  );
}

export function FileIcon({ name, size = 40 }: { name: string; size?: number }) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const t = ext === 'pdf' ? 'bg-red-50 text-red-600' : /jpe?g|png|webp/.test(ext) ? 'bg-sky-50 text-sky-600' : /docx?/.test(ext) ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600';
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center rounded-xl font-display text-[10px] font-extrabold uppercase', t)} style={{ width: size, height: size }}>
      {ext === 'jpeg' ? 'JPG' : ext.slice(0, 4) || 'FILE'}
    </span>
  );
}
