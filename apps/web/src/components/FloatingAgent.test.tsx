import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FloatingAgent from './FloatingAgent';
import { agentPanelPosition, clampAgent } from '../hooks/useFloatingAgent';
import { setUiLanguage } from '../i18n';

let reducedMotion = false;
beforeEach(() => {
  localStorage.clear(); sessionStorage.clear(); setUiLanguage('en'); reducedMotion = false;
  vi.stubGlobal('innerWidth', 1280); vi.stubGlobal('innerHeight', 900);
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') && reducedMotion,
    media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(), addListener: vi.fn(), removeListener: vi.fn(),
  })));
  vi.stubGlobal('PointerEvent', class extends MouseEvent {
    pointerId: number; isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; this.isPrimary = init.isPrimary ?? true; }
  });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ configured: true }))));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear(); sessionStorage.clear(); setUiLanguage('en'); });

describe('floating Loom Agent', () => {
  it('drags by pointer without opening the chat and restores a bounded, user-specific position', () => {
    const { unmount } = render(<FloatingAgent username="alice" />);
    const launcher = screen.getByRole('button', { name: 'Open Loom Agent' });
    fireEvent.pointerDown(launcher, { pointerId: 7, button: 0, clientX: 1190, clientY: 800 });
    fireEvent.pointerMove(launcher, { pointerId: 7, clientX: 400, clientY: 300 });
    fireEvent.pointerUp(launcher, { pointerId: 7 });
    fireEvent.click(launcher, { detail: 1 });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    const saved = JSON.parse(localStorage.getItem('evergreen:agent:alice:position')!);
    expect(saved.x).toBeLessThan(600); expect(saved.y).toBeLessThan(500);
    unmount(); render(<FloatingAgent username="alice" />);
    expect(screen.getByRole('button', { name: 'Open Loom Agent' })).toHaveStyle({ left: `${saved.x}px`, top: `${saved.y}px` });
  });

  it('supports keyboard repositioning, viewport resizing and cancelled touch gestures', () => {
    localStorage.setItem('evergreen:agent:alice:position', JSON.stringify({ x: 200, y: 200 }));
    render(<FloatingAgent username="alice" />);
    const launcher = screen.getByRole('button', { name: 'Open Loom Agent' });
    fireEvent.keyDown(launcher, { key: 'ArrowLeft', shiftKey: true });
    expect(launcher).toHaveStyle({ left: '160px' });
    fireEvent.pointerDown(launcher, { pointerId: 4, pointerType: 'touch', button: 0, clientX: 160, clientY: 200 });
    fireEvent.pointerMove(launcher, { pointerId: 4, clientX: 300, clientY: 400 });
    fireEvent.pointerCancel(launcher, { pointerId: 4 });
    expect(launcher).toHaveStyle({ left: '160px', top: '200px' });
    vi.stubGlobal('innerWidth', 320); vi.stubGlobal('innerHeight', 240);
    fireEvent(window, new Event('resize'));
    expect(Number.parseInt(launcher.style.top) + 104).toBeLessThanOrEqual(228);
    fireEvent.keyDown(launcher, { key: 'Home' });
    expect(Number.parseInt(launcher.style.left) + 88).toBeLessThanOrEqual(308);
  });

  it('preserves a minimized draft and sends only the consented conversation through the staff endpoint', async () => {
    sessionStorage.setItem('token', 'staff-token');
    const fetcher = vi.mocked(fetch);
    fetcher.mockReset();
    fetcher.mockResolvedValueOnce(new Response(JSON.stringify({ configured: true })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ answer: 'Check the saved invoice status.' })));
    const { container } = render(<FloatingAgent username="alice" />);
    expect(fetcher).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open Loom Agent' }));
    await screen.findByText('Ready - guidance only', {}, { timeout: 10000 });
    fireEvent.change(screen.getByLabelText('Your question'), { target: { value: 'Where do I check an invoice?' } });
    expect(screen.getByRole('button', { name: 'Send question' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Minimize Agent' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Loom Agent' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Open Loom Agent' }));
    expect(screen.getByLabelText('Your question')).toHaveValue('Where do I check an invoice?');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Send question' }));
    await screen.findByText('Check the saved invoice status.');
    expect(fetcher).toHaveBeenCalledTimes(2);
    const [endpoint, options] = fetcher.mock.calls[1];
    expect(String(endpoint)).toMatch(/\/ai\/staff$/);
    expect(JSON.parse(String(options?.body))).toEqual({ message: 'Where do I check an invoice?', history: [] });
    expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer staff-token');
    expect(JSON.stringify({ ...localStorage })).not.toContain('Where do I check');
    await waitFor(() => expect(container.querySelector('.eg-agent')).not.toHaveClass('is-thinking'));
    fireEvent.keyDown(screen.getByLabelText('Your question'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers persistent 2D/3D and motion controls without persisting the conversation', async () => {
    const { container } = render(<FloatingAgent username="alice" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Loom Agent' }));
    await screen.findByText('Ready - guidance only', {}, { timeout: 10000 });
    fireEvent.click(screen.getByRole('button', { name: '2D' }));
    fireEvent.click(screen.getByRole('button', { name: 'Motion' }));
    expect(container.querySelector('.eg-agent')).toHaveAttribute('data-appearance', '2d');
    expect(container.querySelector('.eg-agent')).toHaveAttribute('data-animated', 'false');
    expect(JSON.parse(localStorage.getItem('evergreen:agent:alice:appearance')!)).toEqual({ depth: false, animate: false });
    expect(screen.getByRole('button', { name: '2D' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('honors reduced motion and switches the panel and question controls into Tamil', async () => {
    reducedMotion = true;
    const { container } = render(<FloatingAgent username="alice" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Loom Agent' }));
    await screen.findByText('Ready - guidance only', {}, { timeout: 10000 });
    expect(screen.getByRole('button', { name: 'Motion' })).toBeDisabled();
    expect(container.querySelector('.eg-agent')).toHaveAttribute('data-animated', 'false');
    act(() => setUiLanguage('ta'));
    expect(screen.getByRole('dialog', { name: 'லூம் உதவியாளர்' })).toBeVisible();
    expect(screen.getByLabelText('உங்கள் கேள்வி')).toBeVisible();
    expect(screen.getByRole('button', { name: 'கேள்வியை அனுப்பு' })).toBeDisabled();
  });

  it('aborts the assistant request when the authenticated widget unmounts', async () => {
    const { unmount } = render(<FloatingAgent username="alice" />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Loom Agent' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 10000 });
    const signal = vi.mocked(fetch).mock.calls[0][1]?.signal;
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});

describe('Agent screen bounds', () => {
  it('keeps a displaced launcher and panel visible after switching to a small zoomed viewport', () => {
    const viewport = { width: 320, height: 360, left: 30, top: 140 };
    const point = clampAgent({ x: 4000, y: -200 }, viewport);
    const panel = agentPanelPosition(point, viewport);
    expect(point.x + 88).toBeLessThanOrEqual(viewport.left + viewport.width - 12);
    expect(point.y).toBeGreaterThanOrEqual(viewport.top + 12);
    expect(panel.x).toBeGreaterThanOrEqual(viewport.left + 12);
    expect(panel.y).toBeGreaterThanOrEqual(viewport.top + 12);
    expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.left + viewport.width - 12);
    expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.top + viewport.height - 12);
  });
});
