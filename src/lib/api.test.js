import { afterEach, describe, expect, it, vi } from 'vitest';

describe('apiFetch', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('adds json headers and returns json payloads', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.test');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'application/json' },
        json: async () => ({ ok: true }),
      }),
    );

    const { apiFetch } = await import('./api.js');
    const payload = await apiFetch('/api/tools', {
      method: 'POST',
      body: JSON.stringify({ hello: 'world' }),
    });

    expect(payload).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      'https://example.test/api/tools',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
      }),
    );
    const headers = fetch.mock.calls[0][1].headers;
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('turns json error responses into thrown errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        headers: { get: () => 'application/json' },
        json: async () => ({ error: 'Access denied.' }),
      }),
    );

    const { apiFetch } = await import('./api.js');

    await expect(apiFetch('/api/chat')).rejects.toThrow('Access denied.');
  });

  it('turns text error responses into thrown errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        headers: { get: () => 'text/plain' },
        text: async () => 'Gateway unavailable.',
      }),
    );

    const { apiFetch } = await import('./api.js');

    await expect(apiFetch('https://contoso.test/health')).rejects.toThrow('Gateway unavailable.');
  });
});
