import React, { Suspense, useMemo, useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const YarnCore = () => {
  const core = useRef<THREE.Group>(null);
  const accent = useRef<THREE.Mesh>(null);
  const theme = useTheme();

  useFrame((state) => {
    if (!core.current) return;
    const time = state.clock.getElapsedTime();
    core.current.rotation.y = time * 0.22;
    core.current.rotation.x = Math.sin(time * 0.4) * 0.06;
    if (accent.current) {
      accent.current.rotation.z = time * 0.35;
    }
  });

  const palette = useMemo(() => ({
    base: theme.palette.mode === 'dark' ? '#d1fae5' : '#ecfdf5',
    dark: theme.palette.mode === 'dark' ? '#059669' : '#047857',
    glow: theme.palette.mode === 'dark' ? '#6ee7b7' : '#10b981',
  }), [theme.palette.mode]);

  return (
    <group ref={core}>
      <mesh>
        <cylinderGeometry args={[0.7, 0.95, 2.1, 28, 1]} />
        <meshStandardMaterial color={palette.base} roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.16, 12, 36]} />
        <meshStandardMaterial color={palette.glow} roughness={0.35} metalness={0.12} />
      </mesh>
      <mesh ref={accent} position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.42, 28, 28]} />
        <meshStandardMaterial color={palette.dark} roughness={0.28} metalness={0.12} />
      </mesh>
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.95, 1.0, 0.28, 28]} />
        <meshStandardMaterial color={palette.dark} roughness={0.45} metalness={0.08} />
      </mesh>
    </group>
  );
};

const DashboardScene: React.FC = () => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        height: 260,
        borderRadius: 4,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(5,150,105,0.12)'}`,
        bgcolor: theme.palette.mode === 'dark'
          ? 'linear-gradient(180deg, #09111f 0%, #0f172a 100%)'
          : 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
        boxShadow: theme.palette.mode === 'dark'
          ? '0 18px 50px rgba(0,0,0,0.25)'
          : '0 18px 40px rgba(5,150,105,0.12)',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.2, 5.4], fov: 42 }}
        dpr={[1, 1.4]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
      >
        <Suspense fallback={null}>
          <color attach="background" args={[theme.palette.mode === 'dark' ? '#0f172a' : '#ecfdf5']} />
          <fog attach="fog" args={[theme.palette.mode === 'dark' ? '#0f172a' : '#ecfdf5', 2, 12]} />
          <ambientLight intensity={1.2} color={theme.palette.primary.light} />
          <directionalLight position={[3, 5, 4]} intensity={2.2} color={theme.palette.primary.main} />
          <directionalLight position={[-4, -1, 2]} intensity={0.8} color={theme.palette.secondary.main} />
          <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.18}>
            <YarnCore />
          </Float>
          <OrbitControls enablePan={false} enableZoom={false} enableRotate={!prefersReducedMotion} autoRotate={!prefersReducedMotion} autoRotateSpeed={0.6} />
          <Environment preset={theme.palette.mode === 'dark' ? 'night' : 'studio'} />
        </Suspense>
      </Canvas>
    </Box>
  );
};

export default DashboardScene;
