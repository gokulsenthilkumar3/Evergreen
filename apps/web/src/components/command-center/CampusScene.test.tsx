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
  it('pauses continuous rendering and resumes it without remounting the canvas', () => {
    render(<CampusScene {...props} />);
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
    expect(screen.getByTestId('campus-canvas')).toHaveAttribute('data-mode', 'demand');
    expect(screen.getByRole('button', { name: /^Play$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Camera tour' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /02 Receiving/ }));
    expect(screen.getByText('Cotton stock unavailable')).toBeInTheDocument();
  });
});
