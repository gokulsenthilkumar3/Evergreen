import React, { useRef, useMemo, Suspense } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Canvas, useFrame } from '@react-three/fiber';
import type { RootState, ThreeElements } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Extend JSX namespace for Three.js elements
declare global {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements { }
    }
}

interface LoginAvatarProps {
    isPasswordFocused: boolean;
    isTyping: boolean;
    isLoading?: boolean;
    hasError?: boolean;
    compact?: boolean;
}

// --- CUSTOM IRIDESCENT SHADER ---
const IridescentMaterial = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state: RootState) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vNormal = normalMatrix * normal;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            uniform float uTime;
            uniform vec3 uColor;
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float fresnel = pow(1.0 - dot(normal, viewDir), 3.0);
                vec3 iridescent = 0.5 + 0.5 * sin(2.0 * 3.1416 * (fresnel + uTime * 0.2 + normal));
                gl_FragColor = vec4(uColor * iridescent + fresnel * 0.5, 0.85);
            }
        `
    }), []);

    return <shaderMaterial ref={materialRef} args={[shaderArgs]} transparent side={THREE.DoubleSide} />;
};

// --- CHARACTER COMPONENT ---
const Character = ({ isPasswordFocused, isLoading, hasError }: Partial<LoginAvatarProps>) => {
    const group = useRef<THREE.Group>(null);
    const eyesRef = useRef<THREE.Group>(null);
    const theme = useTheme();

    const colors = useMemo(() => ({
        shell: theme.palette.mode === 'dark' ? '#d1fae5' : '#e6fff4',
        shellDark: theme.palette.mode === 'dark' ? '#34d399' : '#059669',
        glow: theme.palette.mode === 'dark' ? '#6ee7b7' : '#10b981',
        accent: theme.palette.mode === 'dark' ? '#a7f3d0' : '#047857',
        paper: theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
    }), [theme.palette.mode]);

    useFrame((state: RootState, delta: number) => {
        if (!group.current) return;
        const time = state.clock.getElapsedTime();

        // Base idle animation
        let targetY = Math.sin(time * 0.6) * 0.08 - 0.45;
        let targetRotY = Math.sin(time * 0.4) * 0.035;

        // Logic Tweaks
        if (isPasswordFocused) targetY -= 0.2;
        if (hasError) {
            targetRotY += Math.sin(time * 60) * 0.08;
            targetY += Math.cos(time * 40) * 0.05;
        }

        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.1);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.1);

        // Eyes Animation
        if (eyesRef.current) {
            if (isLoading) {
                eyesRef.current.rotation.z -= delta * 10;
            } else {
                eyesRef.current.rotation.z = THREE.MathUtils.lerp(eyesRef.current.rotation.z, 0, 0.1);
            }
        }
    });

    const hairPositions = useMemo(() => {
        const arr = new Float32Array(6000 * 3);
        for (let i = 0; i < 6000; i++) {
            const r = 1.0 + Math.random() * 0.8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1) * 0.72;
            arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            arr[i * 3 + 1] = 1.72 + r * Math.cos(phi) * 1.4 - 0.95;
            arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 0.4;
        }
        return arr;
    }, []);

    return (
        <group ref={group}>
            {/* YARN SPOOL BODY */}
            <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.95, 0.82, 2.2, 32, 1]} />
                <meshStandardMaterial
                    color={colors.shell}
                    roughness={0.55}
                    metalness={0.08}
                    emissive={colors.shellDark}
                    emissiveIntensity={0.06}
                />
            </mesh>

            {/* YARN WRAP */}
            <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.78, 0.18, 12, 32]} />
                <meshStandardMaterial color={colors.glow} roughness={0.35} metalness={0.12} />
            </mesh>

            <mesh position={[0, 2.15, 0]}>
                <sphereGeometry args={[0.48, 32, 32]} />
                <meshStandardMaterial color={colors.accent} roughness={0.35} metalness={0.08} />
            </mesh>

            {/* EYES / STATUS LIGHTS */}
            <group ref={eyesRef} position={[0, 1.95, 0.52]}>
                <group position={[-0.22, 0, 0]}>
                    <mesh><sphereGeometry args={[0.09, 24, 24]} /><meshBasicMaterial color={colors.paper} /></mesh>
                    <mesh scale={1.8}><sphereGeometry args={[0.09, 20, 20]} /><meshBasicMaterial color={colors.glow} transparent opacity={0.28} blending={THREE.AdditiveBlending} /></mesh>
                </group>
                <group position={[0.22, 0, 0]}>
                    <mesh><sphereGeometry args={[0.09, 24, 24]} /><meshBasicMaterial color={colors.paper} /></mesh>
                    <mesh scale={1.8}><sphereGeometry args={[0.09, 20, 20]} /><meshBasicMaterial color={colors.glow} transparent opacity={0.28} blending={THREE.AdditiveBlending} /></mesh>
                </group>
            </group>

            {/* SPOOL BASE */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[1.05, 1.1, 0.32, 32]} />
                <meshStandardMaterial color={colors.shellDark} roughness={0.45} metalness={0.15} />
            </mesh>

            {/* LIGHTWEIGHT PARTICLE RING */}
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[hairPositions, 3]} />
                </bufferGeometry>
                <pointsMaterial color={theme.palette.primary.main} size={0.02} transparent opacity={0.35} blending={THREE.AdditiveBlending} />
            </points>
        </group>
    );
};

const LoginAvatar: React.FC<LoginAvatarProps> = (props: LoginAvatarProps) => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const theme = useTheme();
    const compact = props.compact ?? false;

    return (
        <Box
            sx={{
                width: compact ? '100%' : 280,
                height: compact ? 240 : 320,
                maxWidth: 320,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '22px',
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.18), transparent 55%), linear-gradient(180deg, #08111f 0%, #0f172a 100%)'
                  : 'radial-gradient(circle at 30% 20%, rgba(16,185,129,0.12), transparent 55%), linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                  ? '0 20px 60px rgba(0,0,0,0.35)'
                  : '0 18px 45px rgba(5,150,105,0.16)',
                border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(5,150,105,0.14)'}`
            }}
        >
            <Canvas
                camera={{ position: [0, 1.6, 7], fov: 45 }}
                dpr={[1, compact ? 1.4 : 1.75]}
                gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
                frameloop={prefersReducedMotion ? 'demand' : 'always'}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={[theme.palette.mode === 'dark' ? '#0f172a' : '#f0fdf4']} />
                    <fog attach="fog" args={[theme.palette.mode === 'dark' ? '#0f172a' : '#f0fdf4', 2, 18]} />

                    <ambientLight intensity={1.25} color={theme.palette.primary.light} />
                    <pointLight position={[8, 7, 6]} color={theme.palette.primary.main} intensity={2.8} />
                    <pointLight position={[-8, 4, 3]} color={theme.palette.secondary.main} intensity={1.2} />

                    {!prefersReducedMotion && (
                        <Stars radius={28} depth={28} count={600} factor={2.5} saturation={0} fade speed={0.45} />
                    )}

                    <Float speed={1.1} rotationIntensity={0.18} floatIntensity={0.18}>
                        <Character {...props} />
                    </Float>

                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 1.5}
                        enableDamping
                        dampingFactor={0.08}
                        makeDefault
                    />

                    <Environment preset={theme.palette.mode === 'dark' ? 'night' : 'studio'} />
                </Suspense>
            </Canvas>
        </Box>
    );
};

export default LoginAvatar;
