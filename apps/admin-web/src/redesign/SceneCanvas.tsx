import { useEffect, useRef } from "react";
type Point = [number, number, number];
const vertices: Point[] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];
const faces = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [0, 4, 7, 3],
  [1, 5, 6, 2],
  [3, 2, 6, 7],
  [0, 1, 5, 4],
];
export default function SceneCanvas({
  scene,
  active,
  onReady,
}: {
  scene: string;
  active: boolean;
  onReady: (ready: boolean) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    if (!node || navigator.userAgent.includes("jsdom")) return;
    let ctx: CanvasRenderingContext2D | null;
    try {
      ctx = node.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;
    onReady(true);
    let frame = 0,
      last = 0,
      width = 1,
      height = 1;
    const started = performance.now();
    let pointer: Point = [0, 0, 0];
    const reduce = () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.ownerMotion === "reduced";
    const size = () => {
      const box = node.getBoundingClientRect();
      width = box.width;
      height = box.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      node.width = Math.max(1, width * dpr);
      node.height = Math.max(1, height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };
    const project = ([x, y, z]: Point): [number, number] => {
      const scale = (Math.min(width / 8, 42) * 8) / (8 + z);
      return [
        width / 2 + x * scale + pointer[0] * 12,
        height * 0.27 + y * scale + pointer[1] * 8,
      ];
    };
    const draw = (time: number) => {
      ctx!.clearRect(0, 0, width, height);
      const shapes: { points: [number, number][]; z: number; alpha: number }[] =
        [];
      const count =
        scene === "proof"
          ? 7
          : scene === "storage"
            ? 3
            : scene === "events"
              ? 5
              : 8;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + time * 0.12;
        const pos: Point =
          scene === "proof"
            ? [(i - 3) * 0.8, Math.sin(time + i) * 0.08, 0]
            : scene === "storage"
              ? [0, 0, i * 0.3]
              : scene === "rollouts"
                ? [
                    Math.cos(angle) * 2,
                    Math.sin(angle) * 0.6,
                    Math.sin(angle) * 1.5,
                  ]
                : [
                    Math.cos(angle) * 2.6,
                    Math.sin(i * 1.7 + time * 0.5) * 0.4,
                    Math.sin(angle) * 1.4,
                  ];
        const s = scene === "storage" ? 1.2 + i * 0.25 : 0.3 + (i % 3) * 0.08;
        const yaw = time * 0.2 + i * 0.7,
          pitch = 0.45 + Math.sin(time * 0.2 + i) * 0.15;
        const points = vertices.map(([x, y, z]) => {
          x *= s;
          y *= s;
          z *= s;
          const x1 = x * Math.cos(yaw) - z * Math.sin(yaw),
            z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
          return [
            x1 + pos[0],
            y * Math.cos(pitch) - z1 * Math.sin(pitch) + pos[1],
            y * Math.sin(pitch) + z1 * Math.cos(pitch) + pos[2],
          ] as Point;
        });
        faces.forEach((face, j) => {
          const polygon = face.map((index) => points[index]);
          shapes.push({
            points: polygon.map(project),
            z: polygon.reduce((n, p) => n + p[2], 0) / 4,
            alpha: 0.08 + j * 0.035,
          });
        });
      }
      shapes
        .sort((a, b) => b.z - a.z)
        .forEach((shape) => {
          ctx!.beginPath();
          shape.points.forEach(([x, y], i) =>
            i ? ctx!.lineTo(x, y) : ctx!.moveTo(x, y),
          );
          ctx!.closePath();
          const color =
            scene === "proof"
              ? "148,176,216"
              : scene === "events"
                ? "205,171,113"
                : "158,177,235";
          ctx!.fillStyle = `rgba(${color},${shape.alpha * 0.35})`;
          ctx!.strokeStyle = `rgba(${color},${shape.alpha + 0.2})`;
          ctx!.lineWidth = 0.8;
          ctx!.fill();
          ctx!.stroke();
        });
    };
    const loop = (now: number) => {
      if (now - last > 33) {
        draw((now - started) / 1000);
        last = now;
      }
      frame = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      draw(0);
      if (active && !document.hidden && !reduce())
        frame = requestAnimationFrame(loop);
    };
    const move = (event: PointerEvent) => {
      const r = node.getBoundingClientRect();
      pointer = [
        (event.clientX - r.left) / Math.max(1, r.width) - 0.5,
        (event.clientY - r.top) / Math.max(1, r.height) - 0.5,
        0,
      ];
    };
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(size);
    observer?.observe(node);
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    media?.addEventListener("change", sync);
    const preferences = new MutationObserver(sync);
    preferences.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-owner-motion"],
    });
    document.addEventListener("visibilitychange", sync);
    node.parentElement?.addEventListener("pointermove", move);
    size();
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      preferences.disconnect();
      media?.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      node.parentElement?.removeEventListener("pointermove", move);
    };
  }, [scene, active, onReady]);
  return <canvas ref={canvas} className="scene-canvas" aria-hidden="true" />;
}
