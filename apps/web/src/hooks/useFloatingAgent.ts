import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

export type AgentPoint = { x: number; y: number };
export type AgentViewport = { width: number; height: number; left: number; top: number };
export const AGENT_SIZE = { width: 88, height: 104 };
const EDGE = 12;

export function agentViewport(): AgentViewport {
  const viewport = window.visualViewport;
  return {
    width: viewport?.width || window.innerWidth,
    height: viewport?.height || window.innerHeight,
    left: viewport?.offsetLeft || 0,
    top: viewport?.offsetTop || 0,
  };
}

export function clampAgent(point: AgentPoint, viewport: AgentViewport): AgentPoint {
  return {
    x: Math.max(viewport.left + EDGE, Math.min(point.x, viewport.left + viewport.width - AGENT_SIZE.width - EDGE)),
    y: Math.max(viewport.top + EDGE, Math.min(point.y, viewport.top + viewport.height - AGENT_SIZE.height - EDGE)),
  };
}

export function defaultAgentPosition(viewport: AgentViewport): AgentPoint {
  return clampAgent({
    x: viewport.left + viewport.width - AGENT_SIZE.width - 24,
    y: viewport.top + viewport.height - AGENT_SIZE.height - 28,
  }, viewport);
}

/** Keep the entire panel, including its close control, inside the visible keyboard/zoom viewport. */
export function agentPanelPosition(point: AgentPoint, viewport: AgentViewport) {
  const width = Math.max(0, Math.min(396, viewport.width - EDGE * 2));
  const height = Math.max(0, Math.min(viewport.width < 480 ? 680 : 620, viewport.height - EDGE * 2));
  const preferredX = point.x + AGENT_SIZE.width / 2 < viewport.left + viewport.width / 2
    ? point.x : point.x + AGENT_SIZE.width - width;
  return {
    width, height,
    x: Math.max(viewport.left + EDGE, Math.min(preferredX, viewport.left + viewport.width - width - EDGE)),
    y: Math.max(viewport.top + EDGE, Math.min(point.y - height - EDGE, viewport.top + viewport.height - height - EDGE)),
  };
}

function readPosition(key: string, viewport: AgentViewport) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number' && Number.isFinite(saved.x) && Number.isFinite(saved.y))
      return clampAgent(saved, viewport);
  } catch { /* Storage can be unavailable on a shared device. */ }
  return defaultAgentPosition(viewport);
}

export default function useFloatingAgent(username: string) {
  const storageKey = `evergreen:agent:${encodeURIComponent(username)}:position`;
  const [viewport, setViewport] = useState(agentViewport);
  const [position, setPosition] = useState(() => readPosition(storageKey, viewport));
  const [dragging, setDragging] = useState(false);
  const positionRef = useRef(position);
  const ignoreClick = useRef(false);
  const drag = useRef<{
    pointerId: number; origin: AgentPoint; start: AgentPoint; handle: HTMLElement; moved: boolean;
  } | null>(null);

  const move = (next: AgentPoint) => {
    positionRef.current = next;
    setPosition(next);
  };
  const save = (next: AgentPoint) => {
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Keep the position for this session. */ }
  };

  useEffect(() => {
    const resize = () => {
      const nextViewport = agentViewport();
      setViewport(nextViewport);
      setPosition(current => {
        const next = clampAgent(current, nextViewport);
        positionRef.current = next;
        return next;
      });
    };
    window.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('scroll', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('scroll', resize);
    };
  }, []);

  const finish = (cancelled = false) => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    ignoreClick.current = current.moved || cancelled;
    if (cancelled) move(clampAgent(current.origin, agentViewport()));
    else if (current.moved) save(positionRef.current);
    setDragging(false);
    if (current.handle.hasPointerCapture?.(current.pointerId)) current.handle.releasePointerCapture(current.pointerId);
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0 || event.isPrimary === false || drag.current) return;
    ignoreClick.current = false;
    drag.current = {
      pointerId: event.pointerId, origin: positionRef.current,
      start: { x: event.clientX, y: event.clientY }, handle: event.currentTarget, moved: false,
    };
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.start.x, dy = event.clientY - current.start.y;
    if (!current.moved && Math.hypot(dx, dy) < 6) return;
    current.moved = true;
    setDragging(true);
    move(clampAgent({ x: current.origin.x + dx, y: current.origin.y + dy }, agentViewport()));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && drag.current) {
      event.preventDefault(); event.stopPropagation(); finish(true); return;
    }
    const directions: Record<string, AgentPoint> = {
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    };
    if (!directions[event.key] && event.key !== 'Home') return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 10;
    const direction = directions[event.key];
    const next = event.key === 'Home' ? defaultAgentPosition(agentViewport()) : clampAgent({
      x: positionRef.current.x + direction.x * step, y: positionRef.current.y + direction.y * step,
    }, agentViewport());
    move(next); save(next);
  };

  return {
    position, viewport, dragging,
    bindings: {
      onPointerDown, onPointerMove, onKeyDown,
      onPointerUp: (event: PointerEvent<HTMLElement>) => { if (event.pointerId === drag.current?.pointerId) finish(); },
      onPointerCancel: () => finish(true),
      onLostPointerCapture: () => finish(true),
      onDragStart: (event: React.DragEvent) => event.preventDefault(),
    },
    shouldIgnoreClick: (detail: number) => {
      const ignored = ignoreClick.current && detail !== 0;
      ignoreClick.current = false;
      return ignored;
    },
    reset: () => { const next = defaultAgentPosition(agentViewport()); move(next); save(next); },
  };
}
