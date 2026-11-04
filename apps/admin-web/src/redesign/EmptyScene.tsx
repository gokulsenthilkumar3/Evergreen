import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import SceneCanvas from "./SceneCanvas";
/** CSS 3D fallback: deterministic geometry, no WebGL dependency or render loop. */
export default function EmptyScene({
  title,
  body,
  hint,
  scene = "storage",
  children,
}: {
  title: string;
  body: string;
  hint: string;
  scene?: string;
  children?: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [canvasReady,setCanvasReady]=useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  useEffect(() => {
    const changed = () => setForeground(!document.hidden);
    document.addEventListener("visibilitychange", changed);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) =>
            setVisible(entries[0]?.isIntersecting || false),
          );
    if (root.current) observer?.observe(root.current);
    if (!observer) setVisible(true);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", changed);
    };
  }, []);
  return (
    <div
      ref={root}
      className="empty-scene"
      data-scene={scene}
      data-canvas-ready={canvasReady}
      data-animate={visible && foreground}
    >
      <SceneCanvas scene={scene} active={visible&&foreground} onReady={setCanvasReady}/><div className="scene-aurora" aria-hidden="true"/><div className="empty-scene-art" aria-hidden="true">
        <div className="scene-orbit orbit-one" />
        <div className="scene-orbit orbit-two" />
        <div className="scene-core">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <i key={i} className={`scene-face face-${i}`} />
          ))}
        </div>
      </div>
      <div className="empty-scene-copy">
        <p className="workspace-eyebrow">AWAITING A CONNECTION</p>
        <h2>{title}</h2>
        <p>{body}</p>
        {children}
        <small>○ {hint}</small>
      </div>
    </div>
  );
}
