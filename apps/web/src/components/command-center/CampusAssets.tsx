import { useMemo } from 'react';
import { RoundedBox } from '@react-three/drei';
import { BufferGeometry, Float32BufferAttribute } from 'three';

export type Position = [number, number, number];

export function Solid({ position, size, color, rounded = false }: { position: Position; size: Position; color: string; rounded?: boolean }) {
  return rounded ? <RoundedBox position={position} args={size} radius={0.05} smoothness={2} castShadow receiveShadow><meshStandardMaterial color={color} roughness={0.75} /></RoundedBox>
    : <mesh position={position} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} roughness={0.8} /></mesh>;
}

export function FactoryBuilding({ position, width = 4, color = '#3e7fab', selected, onClick }: { position: Position; width?: number; color?: string; selected?: boolean; onClick?: () => void }) {
  return <group position={position} onClick={event => { event.stopPropagation(); onClick?.(); }}>
    <Solid position={[0, 0.08, 0.2]} size={[width + 0.6, 0.16, 3.9]} color={selected ? '#b1dacb' : '#d4dfdf'} rounded />
    <Solid position={[0, 0.95, 0]} size={[width, 1.8, 2.8]} color="#f3f4ef" />
    <Solid position={[0, 1.96, 0]} size={[width + 0.22, 0.24, 3.06]} color={color} />
    <Solid position={[0, 1.63, 1.42]} size={[width, 0.18, 0.08]} color={color} />
    {Array.from({ length: Math.round(width * 2) }, (_, i) => <Solid key={i} position={[-width / 2 + 0.2 + i * 0.5, 2.095, 0]} size={[0.04, 0.03, 3]} color="#87acbf" />)}
    {[-1, 1].map(x => <group key={x}>
      <Solid position={[x * width / 4, 2.12, -0.2]} size={[0.95, 0.06, 1.5]} color="#254c66" />
      {[-0.6, -0.2, 0.2, 0.6].map(z => <Solid key={z} position={[x * width / 4, 2.16, z - 0.2]} size={[0.91, 0.02, 0.02]} color="#8eafbc" />)}
      {/* Industrial Rooftop Solar Panels */}
      {width >= 4 && (
        <group position={[x * width / 4, 2.22, -0.2]}>
          <Solid position={[0, 0.02, 0]} size={[0.88, 0.02, 1.35]} color="#0f2b48" />
          {[-0.4, 0, 0.4].map(sz => (
            <Solid key={sz} position={[0, 0.035, sz]} size={[0.84, 0.01, 0.02]} color="#38bdf8" />
          ))}
        </group>
      )}
      <Solid position={[x * width / 4, 0.77, 1.43]} size={[1.08, 1.42, 0.09]} color="#446172" />
      <Solid position={[x * width / 4, 0.75, 1.49]} size={[0.87, 1.25, 0.05]} color="#a6b7bc" />
      {[0.3, 0.55, 0.8, 1.05, 1.3].map(y => <Solid key={y} position={[x * width / 4, y, 1.525]} size={[0.84, 0.015, 0.015]} color="#7e949e" />)}
      <Solid position={[x * width / 4, 1.52, 1.7]} size={[1.35, 0.08, 0.65]} color={color} />
      {[-0.62, 0.62].map(dx => <group key={dx} position={[x * width / 4 + dx, 0, 1.9]}>
        <Solid position={[0, 0.25, 0]} size={[0.1, 0.5, 0.1]} color="#e8b34e" />
        <Solid position={[0, 0.33, 0]} size={[0.105, 0.09, 0.105]} color="#4d5660" />
      </group>)}
    </group>)}
    <Solid position={[-width / 2 - 0.025, 1.27, 0]} size={[0.04, 0.4, 2.1]} color="#7da4b2" />
    <Solid position={[width / 2 + 0.025, 1.27, 0]} size={[0.04, 0.4, 2.1]} color="#7da4b2" />
    <Solid position={[0, 1.6, 1.49]} size={[0.22, 0.14, 0.04]} color="#f8ce78" />
  </group>;
}

export function HazardBayPad({ position, size = [2.2, 0.03, 3.2], color = '#f59e0b', status = 'active' }: { position: Position; size?: Position; color?: string; status?: string }) {
  return (
    <group position={position}>
      {/* Bay base floor outline */}
      <Solid position={[0, 0.02, 0]} size={size} color="#1e293b" />
      {/* Outer border stripes */}
      <Solid position={[-size[0] / 2 + 0.04, 0.035, 0]} size={[0.08, 0.01, size[2]]} color={color} />
      <Solid position={[size[0] / 2 - 0.04, 0.035, 0]} size={[0.08, 0.01, size[2]]} color={color} />
      <Solid position={[0, 0.035, size[2] / 2 - 0.04]} size={[size[0], 0.01, 0.08]} color={color} />
      {/* Hazard chevron markings on pavement */}
      {[-0.8, -0.3, 0.2, 0.7].map(cz => (
        <Solid key={cz} position={[0, 0.036, cz]} size={[1.4, 0.005, 0.15]} color={color} />
      ))}
    </group>
  );
}

export function DockBeacon({ position, color = '#10b981' }: { position: Position; color?: string }) {
  return (
    <group position={position}>
      <Solid position={[0, 0.9, 0]} size={[0.08, 1.8, 0.08]} color="#475569" />
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.18, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

export function MachineModel({ type, color, selected }: { type: string; color: string; selected: boolean }) {
  const spinning = /RING|OPEN_END|OE|WIND/i.test(type);
  return <group>
    <Solid position={[0, 0.08, 0]} size={[1.3, 0.15, 1]} color={selected ? '#b1dacb' : '#b5c6cd'} rounded />
    <Solid position={[0, 0.4, 0]} size={[1.1, 0.65, 0.76]} color={color} rounded />
    <Solid position={[0.34, 0.91, 0]} size={[0.32, 0.52, 0.25]} color="#edf1ec" rounded />
    <Solid position={[0.34, 1, 0.14]} size={[0.21, 0.16, 0.02]} color="#335664" />
    {(spinning ? [-0.35, -0.03] : [0]).map(x => <group key={x} position={[x, 0.84, 0]}>
      <mesh rotation={spinning ? [0, 0, 0] : [0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={spinning ? [0.12, 0.15, 0.4, 12] : [0.23, 0.23, 0.58, 16]} />
        <meshStandardMaterial color="#f5e7cf" roughness={0.9} />
      </mesh>
    </group>)}
    {[-0.35, 0, 0.35].map(x => <Solid key={x} position={[x, 0.35, 0.39]} size={[0.17, 0.2, 0.015]} color="#48737b" />)}
    {selected && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, 0]}><ringGeometry args={[0.83, 0.87, 48]} /><meshBasicMaterial color="#058768" /></mesh>}
  </group>;
}

export function Landscape() {
  const markings = useMemo(() => {
    const coordinates: number[] = [];
    for (let z = -6; z <= 4; z += 2) for (const x of [-12, 12]) coordinates.push(x, 0.075, z, x, 0.075, z + 0.8);
    for (const x of [-9, -7, 6, 8]) coordinates.push(x, 0.08, 3.5, x, 0.08, 5, x, 0.08, 5, x + 1.6, 0.08, 5);
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(coordinates, 3));
  }, []);
  return <group>
    <Solid position={[0, -0.55, -1]} size={[28.8, 0.5, 22.8]} color="#bacdcb" rounded />
    <lineSegments geometry={markings}><lineBasicMaterial color="#fbf8e9" /></lineSegments>
    {[-8, -4, 0, 4, 8].map(x => <group key={x} position={[x, 0, -11]}>
      <Solid position={[0, 0.14, 0]} size={[2.1, 0.26, 0.85]} color="#d3ded3" rounded />
      <Solid position={[0, 0.5, 0]} size={[0.12, 1, 0.12]} color="#a28d6c" />
      <mesh position={[0, 1.22, 0]} scale={[1, 1.25, 1]} castShadow><icosahedronGeometry args={[0.55, 1]} /><meshStandardMaterial color="#70a68a" roughness={1} /></mesh>
    </group>)}
    {[-10, 10].flatMap(x => [-5, 3].map(z => <group key={`${x}-${z}`} position={[x, 0, z]}>
      <Solid position={[0, 1.2, 0]} size={[0.07, 2.4, 0.07]} color="#7b9299" />
      <Solid position={[0.2, 2.4, 0]} size={[0.46, 0.08, 0.18]} color="#eceddf" rounded />
    </group>))}
    {Array.from({ length: 19 }, (_, i) => <Solid key={i} position={[-13.5 + i * 1.5, 0.45, -11.9]} size={[0.055, 0.9, 0.055]} color="#b1c1c4" />)}
    <Solid position={[0, 0.65, -11.9]} size={[27, 0.045, 0.045]} color="#b1c1c4" />
    <Solid position={[0, 0.25, -11.9]} size={[27, 0.045, 0.045]} color="#b1c1c4" />
    {[-7, 7].map(x => <group key={x} position={[x, 0, 0]}>
      <Solid position={[0, 0.035, 0]} size={[2.8, 0.04, 0.65]} color="#d2dedc" />
      {[-1, -0.5, 0, 0.5, 1].map(dx => <Solid key={dx} position={[dx, 0.07, 0]} size={[0.22, 0.02, 0.6]} color="#fcf9ef" />)}
    </group>)}
  </group>;
}
