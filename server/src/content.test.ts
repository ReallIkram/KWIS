import { describe, it, expect } from 'vitest';
import { clean, contentInput, validateData } from './content.js';
import { passwordHash, hash } from './auth.js';
import bcrypt from 'bcryptjs';
describe('content security', () => {
  it('removes executable rich content while keeping editorial formatting', () => {
    const result = clean(
      '<h2>Hello</h2><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">unsafe</a><a href="https://example.com">safe</a>',
    ) as string;
    expect(result).toContain('<h2>Hello</h2>');
    expect(result).not.toMatch(/script|onerror|javascript|<img/);
    expect(result).toContain('noopener noreferrer');
  });
  it('strips unsafe object keys recursively', () => {
    expect(
      clean(JSON.parse('{"__proto__":{"polluted":true},"nested":{"$where":"danger","safe":"ok"}}')),
    ).toEqual({ nested: { safe: 'ok' } });
    expect(({} as any).polluted).toBeUndefined();
  });
  it('rejects invalid slugs and unbounded display order', () => {
    expect(contentInput.safeParse({ title: 'Valid', slug: '../../admin', data: {} }).success).toBe(
      false,
    );
    expect(contentInput.safeParse({ title: 'Valid', slug: 'valid', order: -1 }).success).toBe(
      false,
    );
  });
  it('hashes passwords and session tokens without storing raw credentials', async () => {
    const value = 'a-long-test-password';
    const result = await passwordHash(value);
    expect(result).not.toBe(value);
    expect(await bcrypt.compare(value, result)).toBe(true);
    expect(await bcrypt.compare('wrong', result)).toBe(false);
    expect(hash('refresh-token')).toHaveLength(64);
  });
  it('rejects unsafe URLs, malformed lists, booleans and invalid map coordinates', () => {
    expect(() => validateData('team', { image: 'javascript:alert(1)' })).toThrow('safe URL');
    expect(() => validateData('team', { skills: 'not an array' })).toThrow('list');
    expect(() => validateData('hero', { enabled: 'false' })).toThrow('true or false');
    expect(() => validateData('locations', { latitude: '91' })).toThrow('range');
    expect(
      validateData('settings', { labels: [{ key: 'code', text: '< possibility />' }] }),
    ).toEqual({ labels: [{ key: 'code', text: '< possibility />' }] });
  });
});
