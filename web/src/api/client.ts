export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export type ApiError = { message: string };

export function getToken() {
  return localStorage.getItem('supcontent_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('supcontent_token', token);
  else localStorage.removeItem('supcontent_token');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  if (response.status === 204) return undefined as T;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as ApiError).message ?? 'Erreur API');
  return data as T;
}

export const posterFallback = 'https://placehold.co/300x450/101828/ffffff?text=SUPCONTENT';
