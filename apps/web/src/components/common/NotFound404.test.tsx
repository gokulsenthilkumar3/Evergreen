import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import NotFound404 from './NotFound404';

describe('page-not-found screen', () => {
  const secret = 'eyJhbGciOiJIUzI1NiJ9.session-token';
  beforeEach(() => localStorage.setItem('token', secret));
  afterEach(() => { cleanup(); localStorage.clear(); });

  it('never puts the signed-in token, or any developer tool, into a link', () => {
    const { container } = render(<NotFound404 pageName="logs" onNavigate={() => undefined} />);
    expect(container.innerHTML).not.toContain(secret);
    expect(container.innerHTML).not.toContain('token=');
    expect(container.querySelectorAll('a[href]')).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/localhost|5555|4301/);
  });

  it('shows only the path, without its query string', () => {
    render(<NotFound404 pageName="reports?token=abc&x=<script>" onNavigate={() => undefined} />);
    expect(screen.getByText('/reports')).toBeTruthy();
  });

  it('offers the way back to the dashboard', () => {
    const onNavigate = vi.fn();
    render(<NotFound404 pageName="nowhere" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByRole('button', { name: /back to dashboard/i }));
    expect(onNavigate).toHaveBeenCalledWith('dashboard');
  });
});
