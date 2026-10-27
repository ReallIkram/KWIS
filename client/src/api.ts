export const API = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
let refreshing: Promise<unknown> | null = null;
export async function request<T = any>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set('Content-Type', 'application/json');
  let res: Response;
  try {
    res = await fetch(API + path, { ...options, headers, credentials: 'include' });
  } catch {
    throw new Error('The API is unavailable. Check your connection or try again shortly.');
  }
  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    refreshing ??= request('/auth/refresh', { method: 'POST' }, false).finally(
      () => (refreshing = null),
    );
    await refreshing;
    return request(path, options, false);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Request failed');
  return body as T;
}
export const send = (method: string, body?: unknown) => ({
  method,
  ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
});
