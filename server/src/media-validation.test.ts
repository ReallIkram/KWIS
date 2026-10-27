import { describe, it, expect } from 'vitest';
import { validateMedia } from './media-validation.js';
describe('upload content validation', () => {
  it('rejects a script disguised as an image or PDF', async () => {
    await expect(validateMedia(Buffer.from('<script>alert(1)</script>'))).rejects.toThrow(
      'Use JPEG',
    );
    await expect(validateMedia(Buffer.from('not a PDF'), true)).rejects.toThrow(
      'Resume must be a PDF',
    );
  });
  it('strips SVG executable elements, event handlers and external references', async () => {
    const result = await validateMedia(
      Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)"><script>alert(1)</script><foreignObject>danger</foreignObject><image href="https://evil.example/image"/><path d="M0 0L10 10" stroke="red"/></svg>',
      ),
    );
    expect(result.mime).toBe('image/svg+xml');
    const svg = result.buffer.toString();
    expect(svg).not.toMatch(/script|foreignObject|onload|href|<image/);
    expect(svg).toContain('<path');
    expect(svg).toContain('viewBox');
  });
  it('rejects SVG paint URL references', async () => {
    await expect(
      validateMedia(Buffer.from('<svg><path fill="url(https://evil.example/a)"/></svg>')),
    ).rejects.toThrow('self-contained');
  });
});
