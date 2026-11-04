import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react';
import { Box, LinearProgress, useMediaQuery } from '@mui/material';
import { CloseRounded, DragIndicatorRounded, PauseRounded, PlayArrowRounded, RestartAltRounded } from '@mui/icons-material';
import { uiText, useUiLanguage } from '../i18n';
import useFloatingAgent, { agentPanelPosition } from '../hooks/useFloatingAgent';
import AgentMascot from './AgentMascot';
import './FloatingAgent.css';

const StaffAssistant = lazy(() => import('./StaffAssistant'));
type Appearance = { depth: boolean; animate: boolean };
function readAppearance(key: string): Appearance {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    if (value) return { depth: value.depth !== false, animate: value.animate !== false };
  } catch { /* Preferences remain usable without storage. */ }
  return { depth: true, animate: true };
}

export default function FloatingAgent({ username }: { username: string }) {
  useUiLanguage();
  const { position, viewport, dragging, bindings, shouldIgnoreClick, reset } = useFloatingAgent(username);
  const storageKey = `evergreen:agent:${encodeURIComponent(username)}:appearance`;
  const [appearance, setAppearance] = useState(() => readAppearance(storageKey));
  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState(false);
  const [busy, setBusy] = useState(false);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const launcher = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const panelId = useId(), instructionsId = useId();
  const panel = agentPanelPosition(position, viewport);
  const show = () => { setVisited(true); setOpen(true); };
  const close = () => { setOpen(false); launcher.current?.focus({ preventScroll: true }); };
  useEffect(() => { if (open) heading.current?.focus({ preventScroll: true }); }, [open]);
  useEffect(() => {
    const reveal = () => { setVisited(true); setOpen(true); };
    window.addEventListener('evergreen:agent-open', reveal);
    return () => window.removeEventListener('evergreen:agent-open', reveal);
  }, []);
  const prefer = (next: Partial<Appearance>) => {
    const value = { ...appearance, ...next };
    setAppearance(value);
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch { /* Device-local preference only. */ }
  };
  return (
    <Box
      className={`eg-agent no-print ${dragging ? 'is-dragging' : ''} ${busy ? 'is-thinking' : ''}`}
      data-appearance={appearance.depth ? '3d' : '2d'}
      data-animated={appearance.animate && !reducedMotion}
      onKeyDown={event => { if (event.key === 'Escape' && open && !event.defaultPrevented) { event.stopPropagation(); close(); } }}
      sx={theme => ({
        '--agent-surface': theme.palette.background.paper,
        '--agent-text': theme.palette.text.primary,
        '--agent-muted': theme.palette.text.secondary,
        '--agent-line': theme.palette.divider,
        '--agent-tint': theme.palette.mode === 'dark' ? '#173b32' : '#edf8f2',
        '--agent-field': theme.palette.mode === 'dark' ? '#102a24' : '#fff',
        '--agent-accent': theme.palette.mode === 'dark' ? '#9be7bc' : '#14694f',
        '--agent-error': theme.palette.error.main,
        zIndex: theme.zIndex.drawer + 1,
      })}
    >
      <p id={instructionsId} className="eg-agent-sr-only">{uiText('Drag to move. Use arrow keys to move, Shift for larger steps, and Home to reset. Press Enter to open and Escape to minimize.')}</p>
      <button
        ref={launcher}
        type="button"
        className="eg-agent-launcher"
        style={{ left: position.x, top: position.y }}
        {...bindings}
        aria-label={uiText(open ? 'Minimize Loom Agent' : 'Open Loom Agent')}
        aria-describedby={instructionsId}
        aria-expanded={open}
        aria-controls={visited ? panelId : undefined}
        aria-haspopup="dialog"
        title={uiText('Drag me or click to chat')}
        onClick={event => { if (!shouldIgnoreClick(event.detail)) { if (open) close(); else show(); } }}
      >
        <span className="eg-agent-orbit" aria-hidden="true" />
        <span className="eg-agent-character"><AgentMascot depth={appearance.depth} /></span>
        <span className="eg-agent-launcher-label"><span className="eg-agent-indicator" aria-hidden="true" />{uiText('Agent')}</span>
      </button>
      {visited && (
        <div
          id={panelId}
          className="eg-agent-panel"
          role="dialog"
          aria-label={uiText('Loom Agent')}
          hidden={!open}
          style={{ left: panel.x, top: panel.y, width: panel.width, height: panel.height }}
        >
          <div ref={heading} tabIndex={-1} className="eg-agent-panel-header">
            <button type="button" className="eg-agent-grab" aria-label={uiText('Move Agent')} aria-describedby={instructionsId} {...bindings}>
              <DragIndicatorRounded fontSize="small" />
              <span><strong>{uiText('Loom Agent')}</strong><small>{uiText(busy ? 'Thinking...' : 'Your workflow companion')}</small></span>
            </button>
            <button type="button" className="eg-agent-icon-button" onClick={reset} aria-label={uiText('Reset Agent position')} title={uiText('Reset Agent position')}><RestartAltRounded fontSize="small" /></button>
            <button type="button" className="eg-agent-icon-button" onClick={close} aria-label={uiText('Minimize Agent')} title={uiText('Minimize Agent')}><CloseRounded fontSize="small" /></button>
          </div>
          <div className="eg-agent-toolbar">
            <div className="eg-agent-appearance" role="group" aria-label={uiText('Agent appearance')}>
              <button type="button" aria-pressed={!appearance.depth} onClick={() => prefer({ depth: false })}>2D</button>
              <button type="button" aria-pressed={appearance.depth} onClick={() => prefer({ depth: true })}>3D</button>
            </div>
            <span className="eg-agent-toolbar-caption">{uiText('Drag to reposition')}</span>
            <button type="button" className="eg-agent-animation-toggle" disabled={reducedMotion} aria-pressed={appearance.animate && !reducedMotion} onClick={() => prefer({ animate: !appearance.animate })} title={uiText(reducedMotion ? 'Animations follow your reduced-motion setting' : appearance.animate ? 'Pause Agent animations' : 'Play Agent animations')}>
              {appearance.animate && !reducedMotion ? <PauseRounded fontSize="small" /> : <PlayArrowRounded fontSize="small" />}
              {uiText('Motion')}
            </button>
          </div>
          <div className="eg-agent-content">
            <Suspense fallback={<LinearProgress aria-label={uiText('Loading Agent')} />}>
              <StaffAssistant embedded onBusyChange={setBusy} />
            </Suspense>
          </div>
        </div>
      )}
    </Box>
  );
}
