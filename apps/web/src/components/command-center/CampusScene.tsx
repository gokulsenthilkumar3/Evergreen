import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Box, MenuItem, Select, useMediaQuery, createTheme, ThemeProvider, useTheme } from '@mui/material';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { CatmullRomCurve3, OrthographicCamera, Vector3, type Group } from 'three';
import FloorCanvas, { type FloorCanvasProps } from './FloorCanvas';
import { FactoryBuilding, Landscape, MachineModel, HazardBayPad, DockBeacon } from './CampusAssets';
import CampusWorkspace, { type ZoneInfo } from './CampusWorkspace';

type Props = FloorCanvasProps & { onNavigate?: (page: string) => void; stockAvailable?: boolean; qualityAvailable?: boolean; dispatchAvailable?: boolean; machinesAvailable?: boolean; inspectionsAvailable?: boolean; activity?: React.ReactNode; metrics?: React.ReactNode };
type Position = [number, number, number];
const VIEWS = ['Campus', 'Receiving', 'Production', 'Warehouse', 'Dispatch', 'People'] as const;
type View = typeof VIEWS[number];
const FOCUS: Record<View, Position> = { Campus: [0, 0, 0], Receiving: [-7, 0, -3], Production: [0, 0, -1], Warehouse: [7, 0, -3], Dispatch: [7, 0, 2], People: [-8, 0, 2] };
const ANGLE: Record<View, Position> = { Campus: [19, 20, 24], Receiving: [13, 11, 19], Production: [16, 17, 18], Warehouse: [18, 14, 17], Dispatch: [18, 11, 16], People: [13, 12, 18] };

function CameraRig({ view, reset, zoom, reduced, onInteract }: { view: View; reset: number; zoom: number; reduced: boolean; onInteract: () => void }) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, invalidate } = useThree();
  const moving = useRef(true);
  const previous = useRef<{ view: View; reset: number } | null>(null);
  const destination = useRef({ target: new Vector3(), position: new Vector3(19, 20, 24), zoom: 12 });
  const goal = useMemo(() => {
    const target = new Vector3(...FOCUS[view]);
    return { target, position: target.clone().add(new Vector3(...ANGLE[view])), zoom: Math.max(6, Math.min(size.width / 37, size.height / 29)) * (view === 'Campus' ? 1 : 1.8) * zoom };
  }, [view, size.width, size.height, zoom]);
  useEffect(() => {
    const newView = previous.current?.view !== view || previous.current?.reset !== reset;
    destination.current = newView ? goal : {
      target: controls.current?.target.clone() ?? goal.target,
      position: camera.position.clone(),
      zoom: goal.zoom,
    };
    previous.current = { view, reset };
    moving.current = true;
    if (reduced && camera instanceof OrthographicCamera) {
      camera.position.copy(destination.current.position);
      camera.zoom = destination.current.zoom;
      camera.updateProjectionMatrix();
      controls.current?.target.copy(destination.current.target);
      controls.current?.update();
      moving.current = false;
    }
    invalidate();
  }, [goal, view, reset, reduced, camera, invalidate]);
  useFrame((_, delta) => {
    if (!moving.current || !(camera instanceof OrthographicCamera) || !controls.current) return;
    const goal = destination.current;
    const step = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
    camera.position.lerp(goal.position, step);
    controls.current.target.lerp(goal.target, step);
    camera.zoom += (goal.zoom - camera.zoom) * step;
    camera.updateProjectionMatrix();
    controls.current.update();
    if (camera.position.distanceTo(goal.position) < 0.01 && Math.abs(camera.zoom - goal.zoom) < 0.01) moving.current = false;
    else invalidate();
  });
  return <OrbitControls ref={controls} makeDefault minZoom={5} maxZoom={90} maxPolarAngle={Math.PI / 2.4} minPolarAngle={0.35} enableDamping={!reduced}
    onStart={() => { moving.current = false; onInteract(); }} />;
}

function Block({ position, size, color }: { position: Position; size: Position; color: string }) {
  return <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.8} />
  </mesh>;
}

function Label({ position, title, detail, expanded }: { position: Position; title: string; detail: string; expanded?: boolean }) {
  const { size } = useThree();
  if (size.width < 600) return null;
  return <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
    <div style={{ background: '#fffffff0', border: '1px solid #dce5e9', borderRadius: 7, padding: '6px 8px', maxWidth: 160, textAlign: 'center', color: '#213547', boxShadow: '0 3px 12px #23364b14', fontSize: expanded ? 11 : 10 }}>
      <strong>{title}</strong>{expanded && <div style={{ color: '#617789', marginTop: 3 }}>{detail}</div>}
    </div>
  </Html>;
}

function PinCallout({ position, code, label, color = '#0284c7', isDark }: { position: Position; code: string; label: string; color?: string; isDark?: boolean }) {
  const { size } = useThree();
  if (size.width < 600) return null;
  return (
    <Html position={position} center zIndexRange={[15, 0]} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          border: `1.5px solid ${color}`,
          borderRadius: 20,
          padding: '4px 10px',
          boxShadow: `0 4px 16px ${color}40`,
          color: isDark ? '#f1f5f9' : '#1e293b',
          whiteSpace: 'nowrap',
          fontSize: 10,
          fontWeight: 700,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        <span style={{ color: color, fontWeight: 800 }}>{code}</span>
        <span style={{ opacity: 0.85 }}>{label}</span>
      </div>
    </Html>
  );
}

function Building({ position, title, detail, color = '#3e7fab', width = 4, selected, onClick }: { position: Position; title: string; detail: string; color?: string; width?: number; selected?: boolean; onClick?: () => void }) {
  return <group position={position}>
    <FactoryBuilding position={[0, 0, 0]} width={width} color={color} selected={selected} onClick={onClick} />
    <Label position={[0, 3.1, 0]} title={title} detail={detail} expanded={selected} />
  </group>;
}

function Wheel({ position, moving, speed }: { position: Position; moving: boolean; speed: number }) {
  const wheel = useRef<Group>(null);
  useFrame((_, delta) => { if (wheel.current && moving) wheel.current.rotation.z -= Math.min(delta, 0.05) * speed * 5; });
  return <group ref={wheel} position={position}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.27, 0.27, 0.15, 12]} /><meshStandardMaterial color="#293e48" /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.165, 12]} /><meshStandardMaterial color="#b8c9ce" metalness={0.3} roughness={0.4} /></mesh>
    <Block position={[0, 0, 0.09]} size={[0.035, 0.2, 0.02]} color="#4b6878" />
  </group>;
}

function Stock({ position, count, bags = false }: { position: Position; count: number; bags?: boolean }) {
  const shown = Math.min(12, Math.max(0, Math.ceil(count)));
  return <group position={position}>
    {Array.from({ length: shown }, (_, i) => <group key={i} position={[(i % 3) * 0.65, Math.floor(i / 6) * 0.5, Math.floor((i % 6) / 3) * 0.7]}>
      <Block position={[0, 0.08, 0]} size={[0.65, 0.12, 0.65]} color="#a78a60" />
      <Block position={[0, 0.36, 0]} size={[0.53, 0.48, 0.53]} color={bags ? '#f8faf5' : '#dbc59e'} />
      <Block position={[0, 0.36, 0.27]} size={[0.08, 0.48, 0.02]} color={bags ? '#059669' : '#b79c6f'} />
    </group>)}
  </group>;
}

function Forklift({
  motion,
  speed,
  offset = 0,
  cargo = 'bale',
  color = '#e5ad38',
  waypoints,
}: {
  motion: boolean;
  speed: number;
  offset?: number;
  cargo?: 'bale' | 'bag' | 'box';
  color?: string;
  waypoints: Position[];
}) {
  const ref = useRef<Group>(null);
  const elapsed = useRef(offset);
  const route = useMemo(
    () => new CatmullRomCurve3(waypoints.map(p => new Vector3(p[0], p[1], p[2])), true, 'catmullrom', 0.15),
    [waypoints],
  );
  const point = useMemo(() => new Vector3(), []);
  const tangent = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (motion) elapsed.current += (Math.min(delta, 0.05) * speed) / 22;
    const phase = elapsed.current % 1;
    route.getPointAt(phase, point);
    route.getTangentAt(phase, tangent);
    ref.current.position.copy(point);
    ref.current.rotation.y = Math.atan2(-tangent.z, tangent.x);
  });

  return (
    <group ref={ref} scale={0.76}>
      <Block position={[0, 0.4, 0]} size={[1.2, 0.6, 0.8]} color={color} />
      <Block position={[-0.25, 1.2, 0]} size={[0.9, 0.1, 0.9]} color="#1e293b" />
      {[-0.36, 0.36].map(z => (
        <group key={z}>
          <Block position={[0.5, 0.8, z]} size={[0.08, 1.3, 0.08]} color="#1e293b" />
          <Block position={[0.9, 0.2, z]} size={[1, 0.07, 0.1]} color="#64748b" />
          <Wheel position={[-0.45, 0.22, z]} moving={motion} speed={speed} />
          <Wheel position={[0.4, 0.22, z]} moving={motion} speed={speed} />
        </group>
      ))}
      <Block position={[-0.1, 0.72, 0]} size={[0.35, 0.25, 0.35]} color="#0f172a" />
      {cargo === 'bale' && (
        <group position={[1.1, 0.46, 0]}>
          <Block position={[0, 0, 0]} size={[0.62, 0.44, 0.62]} color="#dbc59e" />
          <Block position={[0, 0, 0.32]} size={[0.08, 0.44, 0.02]} color="#b79c6f" />
        </group>
      )}
      {cargo === 'bag' && (
        <group position={[1.1, 0.46, 0]}>
          <Block position={[0, 0, 0]} size={[0.58, 0.42, 0.58]} color="#f8faf5" />
          <Block position={[0, 0, 0.3]} size={[0.08, 0.42, 0.02]} color="#059669" />
        </group>
      )}
      {cargo === 'box' && (
        <Block position={[1.1, 0.46, 0]} size={[0.58, 0.42, 0.58]} color="#f59e0b" />
      )}
    </group>
  );
}

function ParkedTruck({ position, rotation = 0, color = '#228b77' }: { position: Position; rotation?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={0.82}>
      <Block position={[0, 0.8, 0]} size={[2.6, 1.25, 1.1]} color="#fafcff" />
      <Block position={[1.85, 0.55, 0]} size={[1, 0.95, 1.05]} color={color} />
      <Block position={[2.36, 0.75, 0]} size={[0.03, 0.3, 0.8]} color="#293e58" />
      <Block position={[0, 0.83, 0.56]} size={[1.5, 0.16, 0.02]} color="#059669" />
      <Block position={[0, 0.25, 0]} size={[4.2, 0.14, 0.82]} color="#4c626e" />
      {[-0.38, 0.38].map(z => <Block key={z} position={[2.37, 0.42, z]} size={[0.04, 0.12, 0.15]} color="#fff4cf" />)}
      {[-0.8, 1.8].flatMap(x => [-0.6, 0.6].map(z => (
        <group key={`${x}-${z}`} position={[x, 0.25, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.27, 0.27, 0.15, 12]} /><meshStandardMaterial color="#293e48" /></mesh>
        </group>
      )))}
      {/* Blinking hazard taillights */}
      {[-0.45, 0.45].map(z => (
        <mesh key={z} position={[-2.12, 0.45, z]}>
          <boxGeometry args={[0.05, 0.1, 0.1]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Truck({ motion, speed, offset = 0 }: { motion: boolean; speed: number; offset?: number }) {
  const truck = useRef<Group>(null);
  const elapsed = useRef(offset);
  const route = useMemo(() => new CatmullRomCurve3([
    [-10, 0, 7], [10, 0, 7], [12, 0, 5], [12, 0, -7], [10, 0, -9], [-10, 0, -9], [-12, 0, -7], [-12, 0, 5]
  ].map(p => new Vector3(p[0], p[1], p[2])), true, 'catmullrom', 0.12), []);
  const point = useMemo(() => new Vector3(), []);
  const tangent = useMemo(() => new Vector3(), []);
  useFrame((_, delta) => {
    if (!truck.current) return;
    if (motion) elapsed.current += Math.min(delta, 0.05) * speed / 65;
    const phase = elapsed.current % 1;
    route.getPointAt(phase, point);
    route.getTangentAt(phase, tangent);
    truck.current.position.copy(point);
    truck.current.rotation.y = Math.atan2(-tangent.z, tangent.x);
  });
  return <group ref={truck} position={[3, 0, 7]} scale={0.8}>
    <Block position={[0, 0.8, 0]} size={[2.6, 1.25, 1.1]} color="#fafcff" />
    <Block position={[1.85, 0.55, 0]} size={[1, 0.95, 1.05]} color={offset ? '#4f7ba6' : '#228b77'} />
    <Block position={[2.36, 0.75, 0]} size={[0.03, 0.3, 0.8]} color="#293e58" />
    <Block position={[0, 0.83, 0.56]} size={[1.5, 0.16, 0.02]} color="#059669" />
    <Block position={[0, 0.25, 0]} size={[4.2, 0.14, 0.82]} color="#4c626e" />
    {[-0.38, 0.38].map(z => <Block key={z} position={[2.37, 0.42, z]} size={[0.04, 0.12, 0.15]} color="#fff4cf" />)}
    {[-0.8, 1.8].flatMap(x => [-0.6, 0.6].map(z => <Wheel key={`${x}-${z}`} position={[x, 0.25, z]} moving={motion} speed={speed} />))}
  </group>;
}

function World({ props, motion, speed, selected, onSelect, view, onFocus, isDark }: { props: Props; motion: boolean; speed: number; selected: number | null; onSelect: (id: number) => void; view: View; onFocus: (view: View) => void; isDark?: boolean }) {
  const shown = props.machines.slice(0, 12);
  const chosen = props.machines.find(m => m.id === selected);
  if (chosen && !shown.some(m => m.id === chosen.id)) shown[shown.length - 1] = chosen;
  return <>
    <color attach="background" args={[isDark ? '#0b1326' : '#e8efec']} />
    <hemisphereLight args={[isDark ? '#38bdf8' : '#eaf5ff', isDark ? '#0f172a' : '#b4c1a5', isDark ? 1.6 : 2]} />
    <directionalLight position={[-8, 18, 9]} intensity={isDark ? 1.8 : 2.4} color={isDark ? '#bae6fd' : '#fff4dd'} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={22} shadow-camera-bottom={-22} shadow-normalBias={0.06} shadow-bias={-0.0001} />
    <Block position={[0, -0.2, -1]} size={[28, 0.4, 22]} color={isDark ? '#141e33' : '#dfe8ef'} />
    <Block position={[0, 0.01, -1]} size={[27, 0.03, 20]} color={isDark ? '#0f172a' : '#b5c6dd'} />
    <Block position={[0, 0.035, -1]} size={[21, 0.04, 13]} color={isDark ? '#1e293b' : '#e8eef3'} />
    {[-9, 7].flatMap(z => Array.from({ length: 11 }, (_, i) => <Block key={`${z}-${i}`} position={[-10 + i * 2, 0.055, z]} size={[0.9, 0.02, 0.06]} color="#ffffff" />))}
    <Landscape />
    <Building position={[-7, 0, -4]} title="Cotton receiving" detail={props.stockAvailable ? `${props.cottonKg.toLocaleString('en-IN')} kg · ≈ ${props.cottonBales} bales` : 'Stock unavailable'} selected={view === 'Receiving'} onClick={() => onFocus('Receiving')} />
    <Building position={[0, 0, -4]} title="Production hall" detail={props.machinesAvailable ? `${props.machines.length} registered machines` : 'Machine data unavailable'} width={6} selected={view === 'Production'} onClick={() => onFocus('Production')} />
    <Building position={[7, 0, -4]} title="Yarn warehouse" detail={props.stockAvailable ? `${props.yarnKg.toLocaleString('en-IN')} kg · ${props.yarnBags} bag equivalents` : 'Stock unavailable'} color="#168d78" selected={view === 'Warehouse'} onClick={() => onFocus('Warehouse')} />
    <Building position={[-8, 0, 2]} title="People & office" detail="Staff · customers · finance" width={3} color="#6d86b6" selected={view === 'People'} onClick={() => onFocus('People')} />
    <Building position={[8, 0, 2]} title="Quality & dispatch" detail={`${props.qualityAvailable ? props.qualityHolds : '—'} recorded holds · ${props.dispatchAvailable ? props.dispatchCount : '—'} dispatch records`} width={3} color="#bc9956" selected={view === 'Dispatch'} onClick={() => onFocus('Dispatch')} />
    <Stock position={[-8, 0, -1.5]} count={props.cottonBales} />
    <Stock position={[6, 0, -1.5]} count={props.yarnBags} bags />
    {shown.map((machine, i) => {
      const x = -2.4 + (i % 4) * 1.6;
      const z = -0.6 + Math.floor(i / 4) * 1.4;
      const color = machine.openInspections ? '#d8a03c' : machine.active ? '#319e88' : '#94a3b8';
      return <group key={machine.id} position={[x, 0, z]} onClick={event => { event.stopPropagation(); onSelect(machine.id); }}>
        <MachineModel type={machine.type} color={color} selected={selected === machine.id} />
      </group>;
    })}
    {[-11, -5, 5, 11].map(x => <group key={x} position={[x, 0, 8.2]}>
      <Block position={[0, 0.45, 0]} size={[0.12, 0.9, 0.12]} color="#a08b68" />
      <mesh position={[0, 1.1, 0]} castShadow><icosahedronGeometry args={[0.55, 1]} /><meshStandardMaterial color="#8cbfa0" /></mesh>
    </group>)}

    {/* Dock Hazard Pads (Video Replication) */}
    <HazardBayPad position={[6.5, 0.01, 2.5]} color="#10b981" />
    <HazardBayPad position={[9.2, 0.01, 2.5]} color="#0ea5e9" />
    <HazardBayPad position={[-6.8, 0.01, -2.5]} color="#f59e0b" />
    <HazardBayPad position={[-9.2, 0.01, -2.5]} color="#64748b" />

    {/* Dock Beacon Towers */}
    <DockBeacon position={[5.2, 0, 3.8]} color="#10b981" />
    <DockBeacon position={[7.9, 0, 3.8]} color="#0ea5e9" />
    <DockBeacon position={[-5.4, 0, -3.8]} color="#f59e0b" />

    {/* Docked / Loading Trucks */}
    <ParkedTruck position={[6.5, 0, 2.5]} rotation={-Math.PI / 2} color="#10b981" />
    <ParkedTruck position={[9.2, 0, 2.5]} rotation={-Math.PI / 2} color="#0ea5e9" />

    {/* Active Mobile Trucks */}
    <Truck motion={motion} speed={speed} />
    <Truck motion={motion} speed={speed} offset={0.5} />

    {/* Active Forklifts with Dynamic Material Routes */}
    {/* FL-01: Yarn Warehouse to Bay 02 loading */}
    <Forklift
      motion={motion}
      speed={speed}
      offset={0.1}
      cargo="bag"
      color="#eab308"
      waypoints={[
        [5.8, 0, -1.2],
        [7.2, 0, 0.2],
        [8.4, 0, 1.6],
        [7.0, 0, 0.4],
      ]}
    />
    {/* FL-02: Cotton Receiving Yard to Production entry */}
    <Forklift
      motion={motion}
      speed={speed}
      offset={0.6}
      cargo="bale"
      color="#f97316"
      waypoints={[
        [-7.6, 0, -1.2],
        [-5.4, 0, -1.0],
        [-3.2, 0, -1.8],
        [-5.8, 0, -1.5],
      ]}
    />
    {/* FL-03: Plant Apron Material Runner */}
    <Forklift
      motion={motion}
      speed={speed}
      offset={0.35}
      cargo="box"
      color="#eab308"
      waypoints={[
        [1.5, 0, 2.0],
        [4.2, 0, 2.2],
        [4.2, 0, 3.6],
        [1.5, 0, 3.2],
      ]}
    />

    {/* Floating Strategy Game 3D Pins from Reference Video */}
    <PinCallout position={[6.5, 3.8, 2.5]} code="Bay 01" label="Departing · TRK-102" color="#10b981" isDark={isDark} />
    <PinCallout position={[9.2, 3.8, 2.5]} code="Bay 02" label="Loading (80%) · TRK-241" color="#0284c7" isDark={isDark} />
    <PinCallout position={[-7, 3.8, -2.5]} code="Inward Yard" label="Raw Cotton Bales" color="#f59e0b" isDark={isDark} />
    <PinCallout position={[0, 3.8, -2]} code="Machine Hall" label={`${props.machines.length} Equipment Units`} color="#8b5cf6" isDark={isDark} />
  </>;
}

class SceneBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function CampusScene(props: Props) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const compact = useMediaQuery('(max-width: 600px)');
  const [motion, setMotion] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [view, setView] = useState<View>('Campus');
  const [reset, setReset] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [tour, setTour] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [inView, setInView] = useState(true);
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => {
    if (!container.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  const playing = motion && !reduced && visible && inView;
  const focus = (next: View) => { setView(next); setSelected(null); setTour(false); setZoom(1); };
  useEffect(() => {
    if (!cinema) return;
    container.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setCinema(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [cinema, reduced]);
  useEffect(() => {
    if (!tour || !playing) return;
    const timer = setInterval(() => setView(previous => VIEWS[(VIEWS.indexOf(previous) + 1) % VIEWS.length]), 7000);
    return () => clearInterval(timer);
  }, [tour, playing]);
  const selectMachine = (id: number) => {
    setSelected(id);
    setTour(false);
    setView('Production');
  };
  const detail = view === 'Receiving' ? (props.stockAvailable ? `${props.cottonKg.toLocaleString('en-IN')} kg cotton · approximately ${props.cottonBales} bales` : 'Cotton stock unavailable')
    : view === 'Production' ? (props.machinesAvailable ? `${props.machines.length} registered machines · select one to inspect` : 'Machine data unavailable')
      : view === 'Warehouse' ? (props.stockAvailable ? `${props.yarnKg.toLocaleString('en-IN')} kg yarn · ${props.yarnBags} bag equivalents` : 'Yarn stock unavailable')
        : view === 'People' ? 'People, customers and finance · open a workspace below'
      : view === 'Dispatch' ? `${props.dispatchAvailable ? props.dispatchCount : '—'} recorded dispatches · ${props.qualityAvailable ? props.qualityHolds : '—'} quality holds`
        : 'Receiving → production → yarn warehouse → dispatch';
  const number = (value: number, known?: boolean) => known ? value.toLocaleString('en-IN') : '—';
  const chosen = props.machines.find(machine => machine.id === selected);
  const zones: Record<View, ZoneInfo> = {
    Campus: { title: 'Factory overview', subtitle: 'From raw cotton to finished yarn. Select a building to explore its records.', facts: [['Cotton in store', number(props.cottonKg, props.stockAvailable) + ' kg'], ['Yarn in store', number(props.yarnKg, props.stockAvailable) + ' kg'], ['Registered machines', number(props.machines.length, props.machinesAvailable)]], links: [['Inventory', 'inventory'], ['Production & job work', 'production'], ['Customers & ledger', 'customers']] },
    Receiving: { title: 'Cotton receiving', subtitle: detail, facts: [['Cotton stock', number(props.cottonKg, props.stockAvailable) + ' kg'], ['Estimated bales', number(props.cottonBales, props.stockAvailable)]], links: [['Inward batches', 'inward'], ['Supplier portal', 'yarnsupplier']] },
    Production: { title: 'Production hall', subtitle: chosen ? 'Registered equipment. Select inspection history to review maintenance records.' : detail, facts: chosen ? [['Asset type', chosen.type.replaceAll('_', ' ')], ['Registry status', chosen.active ? 'Active asset' : 'Inactive'], ['Open inspections', number(chosen.openInspections ?? 0, props.inspectionsAvailable)], ['Running state', 'Not available']] : [['Registered machines', number(props.machines.length, props.machinesAvailable)], ['Active assets', number(props.machines.filter(machine => machine.active).length, props.machinesAvailable)]], links: [['Production records', 'production'], ['Machine management', 'yarnmachine']] },
    Warehouse: { title: 'Yarn warehouse', subtitle: detail, facts: [['Yarn stock', number(props.yarnKg, props.stockAvailable) + ' kg'], ['60 kg bag equivalents', number(props.yarnBags, props.stockAvailable)]], links: [['Yarn inventory', 'inventory'], ['Warehouse locations', 'yarnwarehouse']] },
    Dispatch: { title: 'Quality & dispatch', subtitle: detail, facts: [['Dispatch records', number(props.dispatchCount, props.dispatchAvailable)], ['Recorded quality holds', number(props.qualityHolds, props.qualityAvailable)]], links: [['Outward dispatches', 'outward'], ['Quality control', 'yarnquality'], ['Sales orders', 'orders']] },
    People: { title: 'People & business', subtitle: 'Connect the factory floor to the people, customer relationships, and finances behind it.', facts: [], links: [['HR & payroll', 'yarnhr'], ['Shift management', 'yarnshift'], ['Customers & ledger', 'customers'], ['Invoices & payments', 'invoicestudio'], ['Costing', 'costing']] },
  };
  const appTheme = useTheme();
  const isDark = appTheme.palette.mode === 'dark';
  const campusTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: { main: isDark ? '#34d399' : '#087f65' },
          text: {
            primary: isDark ? '#f1f5f9' : '#213547',
            secondary: isDark ? '#94a3b8' : '#617789',
          },
        },
      }),
    [isDark],
  );

  return <ThemeProvider theme={campusTheme}><Box ref={container} sx={{ minWidth: 0, scrollMarginTop: 12, '& button': { minHeight: 44, textTransform: 'none', fontWeight: 600 }, '& button:focus-visible': { outline: '2px solid #087f65', outlineOffset: -2 } }}>
    <CampusWorkspace view={view} views={VIEWS} focus={value => focus(value as View)}
      motion={motion} playing={playing} reduced={reduced} toggleMotion={() => setMotion(value => !value)}
      tour={tour} toggleTour={() => { setTour(value => !value); setMotion(true); }} speed={speed} setSpeed={setSpeed}
      cinema={cinema} toggleCinema={() => setCinema(value => !value)} reset={() => { focus('Campus'); setReset(value => value + 1); }}
      zoom={direction => { setZoom(value => Math.max(0.65, Math.min(2.5, value + direction * 0.25))); setTour(false); }}
      resources={[
        ['Cotton stock', number(props.cottonKg, props.stockAvailable) + ' kg'],
        ['Yarn stock', number(props.yarnKg, props.stockAvailable) + ' kg'],
        ['Registered machines', number(props.machines.length, props.machinesAvailable)],
        ['Quality holds', number(props.qualityHolds, props.qualityAvailable)],
      ]}
      zone={zones[view]} activity={props.activity} metrics={props.metrics} onNavigate={props.onNavigate}
      selectedMachine={chosen?.name} onInspect={() => { if (chosen) props.onMachineClick?.(chosen); }} clearSelection={() => setSelected(null)}
      machineSelector={<Select displayEmpty fullWidth size="small" value={chosen?.id ?? ''} inputProps={{ 'aria-label': 'Inspect machine' }} onChange={event => selectMachine(Number(event.target.value))} sx={{ height: 42, fontSize: 12 }}>
        <MenuItem value="" disabled>{props.machines.length ? 'Find a machine…' : props.machinesAvailable ? 'No machines registered' : 'Machine data unavailable'}</MenuItem>
        {props.machines.map(machine => <MenuItem key={machine.id} value={machine.id}>{machine.name}</MenuItem>)}
      </Select>}
    >
      <SceneBoundary fallback={<FloorCanvas {...props} />}>
        <Suspense fallback={<Box sx={{ p: 5 }}>Preparing factory view…</Box>}>
          <Canvas orthographic shadows={!compact} frameloop={playing ? 'always' : 'demand'} camera={{ position: [18, 18, 22], zoom: 12, near: 0.1, far: 100 }} dpr={compact ? 1 : [1, 1.5]} fallback={<FloorCanvas {...props} />}>
            <World props={props} motion={playing} speed={speed} selected={selected} onSelect={selectMachine} view={view} onFocus={focus} isDark={isDark} />
            <CameraRig view={view} reset={reset} zoom={zoom} reduced={reduced} onInteract={() => setTour(false)} />
          </Canvas>
        </Suspense>
      </SceneBoundary>
    </CampusWorkspace>
  </Box></ThemeProvider>;
}