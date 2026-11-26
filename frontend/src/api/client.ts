import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || '';

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  // Demo mode: no backend session, so pages render with sample data instead.
  if (!token && typeof localStorage !== 'undefined' && localStorage.getItem('prevntiv.demo')) {
    throw new Error('DEMO_MODE');
  }

  const res = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = (await res.json()).error ?? message; } catch { /* noop */ }
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

// Convenience helpers
export const get = <T>(path: string) => apiRequest<T>(path);
export const post = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const patch = <T>(path: string, body: unknown) =>
  apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (path: string) =>
  apiRequest(path, { method: 'DELETE' });
