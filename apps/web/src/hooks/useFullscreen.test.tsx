import { useRef } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useFullscreen } from './useFullscreen';
function Player() {
  const ref = useRef<HTMLDivElement>(null);
  const player = useFullscreen(ref);
  return <div ref={ref} data-testid="player"><button onClick={player.toggle}>{player.fullscreen ? 'Exit' : 'Enter'}</button><span>{player.error}</span></div>;
}
afterEach(() => { cleanup(); vi.restoreAllMocks(); Reflect.deleteProperty(document, 'fullscreenElement'); });
it('reports unsupported browsers without a false fullscreen state', async () => {
  render(<Player />);
  fireEvent.click(screen.getByText('Enter'));
  expect(await screen.findByText(/Fullscreen is unavailable/)).toBeInTheDocument();
  expect(screen.getByText('Enter')).toBeInTheDocument();
});
it('uses fullscreenchange as the source of truth including browser Escape', async () => {
  render(<Player />);
  const element = screen.getByTestId('player');
  element.requestFullscreen = vi.fn().mockResolvedValue(undefined);
  fireEvent.click(screen.getByText('Enter'));
  expect(element.requestFullscreen).toHaveBeenCalledOnce();
  const getter = vi.fn<() => Element | null>(() => element);
  Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: getter });
  act(() => document.dispatchEvent(new Event('fullscreenchange')));
  expect(screen.getByText('Exit')).toBeInTheDocument();
  getter.mockReturnValue(null);
  act(() => document.dispatchEvent(new Event('fullscreenchange')));
  expect(screen.getByText('Enter')).toBeInTheDocument();
});
it('reports a rejected fullscreen request and leaves the player usable', async () => {
  render(<Player />);
  screen.getByTestId('player').requestFullscreen = vi.fn().mockRejectedValue(new Error('Denied'));
  fireEvent.click(screen.getByText('Enter'));
  expect(await screen.findByText(/browser could not enter fullscreen/)).toBeInTheDocument();
  expect(screen.getByText('Enter')).toBeInTheDocument();
});
