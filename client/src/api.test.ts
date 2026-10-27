import { afterEach, describe, it, expect, vi } from 'vitest';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe('deployment modes', () => {
  it('serves initial content in standalone builds and rejects mutations without pretending success', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_API_BASE_URL', '');
    vi.resetModules();
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] })));
    vi.stubGlobal('fetch', fetch);
    const { STATIC_MODE, request } = await import('./api');
    expect(STATIC_MODE).toBe(true);
    expect(await request('/public/content')).toEqual({ data: [] });
    expect(fetch.mock.calls[0][0]).toContain('initial-content.json');
    await expect(request('/public/contact', { method: 'POST', body: '{}' })).rejects.toThrow(
      'unavailable',
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('uses the configured real API as soon as its URL is supplied', async () => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/api/v1');
    vi.resetModules();
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [] })));
    vi.stubGlobal('fetch', fetch);
    const { STATIC_MODE, request } = await import('./api');
    expect(STATIC_MODE).toBe(false);
    await request('/public/content');
    expect(fetch.mock.calls[0][0]).toBe('https://api.example.com/api/v1/public/content');
  });
});
