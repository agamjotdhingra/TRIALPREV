import { useAuth } from '@/auth/AuthContext';

interface QueryLike<T> {
  data?: T[] | null;
  isLoading: boolean;
  isError?: boolean;
  error?: unknown;
}

/**
 * Picks the data source for a list screen.
 * - Signed-in users see their live data (with real empty/error states).
 * - Demo explorers see the curated sample data from the designs.
 */
export function useSource<T, R>(query: QueryLike<T>, demo: R[], map: (row: T) => R) {
  const { isDemo } = useAuth();
  if (isDemo) return { rows: demo, loading: false, error: null as string | null, isDemo };
  const err = query.isError ? (query.error instanceof Error ? query.error.message : 'Something went wrong') : null;
  return { rows: (query.data ?? []).map(map), loading: query.isLoading, error: err, isDemo };
}

export function fmtDate(d?: string | Date | null, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }) {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-GB', opts);
}

export function fmtTime(d?: string | Date | null) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function parseList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') {
    try {
      const p = JSON.parse(v);
      if (Array.isArray(p)) return p.map((x) => (typeof x === 'string' ? x : x?.name ?? JSON.stringify(x)));
    } catch {
      /* not JSON */
    }
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
