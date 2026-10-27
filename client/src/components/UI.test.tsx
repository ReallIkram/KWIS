// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SafeLink, RichText } from './UI';
afterEach(cleanup);
describe('safe content rendering', () => {
  it('does not render executable link schemes', () => {
    render(
      <MemoryRouter>
        <SafeLink to="javascript:alert(1)">Unsafe</SafeLink>
        <SafeLink to="/services">Services</SafeLink>
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: 'Unsafe' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Services' }).getAttribute('href')).toBe('/services');
  });
  it('sanitizes rich content even if a compromised API sends unsafe HTML', () => {
    const { container } = render(
      <RichText html={'<h2>Article</h2><img src=x onerror="alert(1)"><script>alert(1)</script>'} />,
    );
    expect(screen.getByRole('heading', { name: 'Article' })).toBeTruthy();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')?.getAttribute('onerror')).toBeNull();
  });
});
