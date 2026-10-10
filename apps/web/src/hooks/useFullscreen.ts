import { useEffect, useState, type RefObject } from 'react';

/** Fullscreen follows the browser event, including Escape and rejected requests. */
export function useFullscreen(target: RefObject<HTMLElement | null>) {
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const sync = () => setFullscreen(!!target.current && document.fullscreenElement === target.current);
    document.addEventListener('fullscreenchange', sync);
    sync();
    return () => document.removeEventListener('fullscreenchange', sync);
  }, [target]);
  const toggle = async () => {
    setError('');
    try {
      if (document.fullscreenElement === target.current && document.fullscreenElement) await document.exitFullscreen();
      else if (target.current?.requestFullscreen) await target.current.requestFullscreen();
      else setError('Fullscreen is unavailable in this browser. Use Cinema view.');
    } catch { setError('The browser could not enter fullscreen. Use Cinema view or try again.'); }
  };
  return { fullscreen, error, toggle };
}
