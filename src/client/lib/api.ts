import { SessionUser } from './types';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const fetchSession = () => api<{ user: SessionUser }>('/auth/me');
