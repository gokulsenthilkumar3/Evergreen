import { useEffect, useState } from 'react';
/** CSS perspective keeps this scene lightweight and available without WebGL. */
export default function TextileScene() {
  const [paused, setPaused] = useState(() => { try { return localStorage.getItem('evergreen-marketing-motion') === 'paused'; } catch { return false; } });
  useEffect(() => { document.documentElement.dataset.marketingMotion = paused ? 'paused' : 'running'; return () => { delete document.documentElement.dataset.marketingMotion; }; }, [paused]);
  return <div className={`textile-scene ${paused ? 'textile-scene-paused' : ''}`}>
    <div className="textile-scene-art" aria-hidden="true"><div className="textile-orbit textile-orbit-one" /><div className="textile-orbit textile-orbit-two" /><div className="textile-spool"><div className="textile-spool-cap" /><div className="textile-spool-thread">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ top: `${index * 5.2}%` }} />)}</div><div className="textile-spool-cap textile-spool-bottom" /></div><div className="textile-flow"><span>01 / MATERIAL</span><b /><span>02 / MILL</span><b /><span>03 / MARKET</span></div><div className="textile-scene-caption">ONE CONTINUOUS THREAD.</div></div>
    <button type="button" className="textile-motion-toggle" aria-pressed={paused} onClick={() => setPaused(previous => { const next = !previous; try { localStorage.setItem('evergreen-marketing-motion', next ? 'paused' : 'running'); } catch { /* Visit-only preference. */ } return next; })}>{paused ? 'Play visual motion' : 'Pause visual motion'}</button>
  </div>;
}
