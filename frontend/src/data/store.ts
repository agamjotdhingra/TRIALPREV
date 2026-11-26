import { useSyncExternalStore } from 'react';
import { supabase } from '@/api/supabase';
import { ACCESS_REQUESTS, DOCUMENTS, GRANTS, type Doc, type Grant } from './demo';

/** Tiny client store for patient-side state that has no backend API yet (sharing, recycle bin, staged uploads). */
interface State {
  docs: (Doc & { url?: string })[];
  deleted: (Doc & { deletedAt: string })[];
  grants: Grant[];
  requests: typeof ACCESS_REQUESTS;
  staged: File | null;
}

let state: State = { docs: DOCUMENTS, deleted: [], grants: GRANTS, requests: ACCESS_REQUESTS, staged: null };
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<State> | ((s: State) => Partial<State>)) {
    state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state));
}

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Uploads to the private `documents` bucket and returns the storage path (mirrors the backend contract). */
export async function uploadToStorage(patientId: string | number, file: File) {
  const ext = file.name.split('.').pop();
  const path = `${patientId}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage.from('documents').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  return path;
}

/** Opens a stored document via a short-lived signed URL. */
export async function openStoredFile(fileUrl?: string) {
  if (!fileUrl) throw new Error('This is a sample document — there is no file to open.');
  if (fileUrl.startsWith('http')) return void window.open(fileUrl, '_blank', 'noopener');
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(fileUrl, 60);
  if (error) throw error;
  if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener');
}
