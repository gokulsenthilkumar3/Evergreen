import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const preferences = vi.hoisted(() => ({ reduced: false }));
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ frameloop }: { frameloop: string }) => <div data-testid="campus-canvas" data-mode={frameloop} />,
  useFrame: vi.fn(), useThree: vi.fn(),
}));
vi.mock('@react-three/drei', () => ({ Html: () => null, OrbitControls: () => null, RoundedBox: () => null }));
import CampusScene from './CampusScene';

const props = { machines: [], cottonKg: 0, cottonBales: 0, yarnKg: 0, yarnBags: 0, productionRunning: false, dispatchCount: 0, qualityHolds: 0, stockAvailable: true, machinesAvailable: true, dispatchAvailable: true, qualityAvailable: true };

beforeEach(() => {
  preferences.reduced = false;
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({ matches: query.includes('prefers-reduced-motion') && preferences.reduced, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() })));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('campus animation controls', () => {
  it('keeps simulation running while switching operational zones', () => {
    render(<CampusScene {...props} />);
    for (const zone of [/\d+ Receiving/, /\d+ Production/, /\d+ Warehouse/, /\d+ Dispatch/, /\d+ People/]) {
      fireEvent.click(screen.getByRole('button', { name: zone }));
      expect(screen.getByTestId('campus-canvas')).toHaveAttribute('data-mode', 'always');
    }
  });
  it('pauses continuous rendering and resumes it without remounting the canvas', () => {
    render(<CampusScene {...props} />);
    fireEvent.click(screen.getByText(/Presentation controls/));
    const canvas = screen.getByTestId('campus-canvas');
    expect(canvas).toHaveAttribute('data-mode', 'always');
    fireEvent.click(screen.getByRole('button', { name: /^Pause$/ }));
    expect(canvas).toHaveAttribute('data-mode', 'demand');
    fireEvent.click(screen.getByRole('button', { name: /^Play$/ }));
    expect(screen.getByTestId('campus-canvas')).toBe(canvas);
    expect(canvas).toHaveAttribute('data-mode', 'always');
  });

  it('advances the guided tour and stops when a zone is selected manually', () => {
    vi.useFakeTimers();
    render(<CampusScene {...props} />);
    fireEvent.click(screen.getByText(/Presentation controls/));
    fireEvent.click(screen.getByRole('button', { name: 'Camera tour' }));
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole('button', { name: /02 Receiving/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /04 Warehouse/ }));
    act(() => vi.advanceTimersByTime(14000));
    expect(screen.getByRole('button', { name: /04 Warehouse/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Camera tour' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('0 kg yarn · 0 bag equivalents')).toBeInTheDocument();
  });

  it('honors reduced motion and avoids showing unknown stock as zero', () => {
    preferences.reduced = true;
    render(<CampusScene {...props} stockAvailable={false} />);
    fireEvent.click(screen.getByText(/Presentation controls/));
    expect(screen.getByTestId('campus-canvas')).toHaveAttribute('data-mode', 'demand');
    expect(screen.getByRole('button', { name: /^Play$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Camera tour' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /02 Receiving/ }));
    expect(screen.getByText('Cotton stock unavailable')).toBeInTheDocument();
  });

  it('pauses a camera tour when hidden and resumes without skipping zones', () => {
    vi.useFakeTimers();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    render(<CampusScene {...props} />);
    fireEvent.click(screen.getByText(/Presentation controls/));
    fireEvent.click(screen.getByRole('button', { name: 'Camera tour' }));
    hidden.mockReturnValue(true);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => vi.advanceTimersByTime(21000));
    expect(screen.getByRole('button', { name: /01 Campus/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('campus-canvas')).toHaveAttribute('data-mode', 'demand');
    hidden.mockReturnValue(false);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole('button', { name: /02 Receiving/ })).toHaveAttribute('aria-pressed', 'true');
    hidden.mockRestore();
  });

  it('cleans up tour timers on unmount', () => {
    vi.useFakeTimers();
    const intervals = vi.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
    const mounted = render(<CampusScene {...props} />);
    fireEvent.click(screen.getByText(/Presentation controls/));
    fireEvent.click(screen.getByText(/Presentation controls/));
    fireEvent.click(screen.getByRole('button', { name: 'Camera tour' }));
    const tourTimer = intervals.mock.results.at(-1)?.value;
    expect(tourTimer).toBeDefined();
    mounted.unmount();
    expect(clearIntervalSpy).toHaveBeenCalledWith(tourTimer);
    intervals.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('applies playback speed to the camera tour', () => {
    vi.useFakeTimers();
    render(<CampusScene {...props} />);
    fireEvent.click(screen.getByText(/Presentation controls/));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Animation speed' }));
    fireEvent.click(screen.getByRole('option', { name: '2×' }));
    fireEvent.click(screen.getByRole('button', { name: 'Camera tour' }));
    act(() => vi.advanceTimersByTime(3500));
    expect(screen.getByRole('button', { name: /02 Receiving/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
