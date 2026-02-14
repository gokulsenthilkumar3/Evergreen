import React, { useRef, useMemo, Suspense } from 'react';
import { Box } from '@mui/material';
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

    useFrame((state: RootState, delta: number) => {
        if (!group.current) return;
        const time = state.clock.getElapsedTime();

        // Base idle animation
        let targetY = Math.sin(time * 0.6) * 0.1 - 0.5;
        let targetRotY = Math.sin(time * 0.4) * 0.05;

        // Logic Tweaks
        if (isPasswordFocused) targetY -= 0.2;
        if (hasError) {
            targetRotY += Math.sin(time * 60) * 0.15;
            targetY += Math.cos(time * 40) * 0.08;
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
            {/* FACE */}
            <mesh position={[0, 1.7, 0]}>
                <sphereGeometry args={[0.95, 64, 64]} />
                <meshStandardMaterial color="#fff2e5" roughness={0.6} metalness={0.05} emissive="#220044" emissiveIntensity={0.1} />
            </mesh>

            {/* EYES */}
            <group ref={eyesRef} position={[0, 1.75, 0.85]}>
                {/* Left */}
                <group position={[-0.34, 0, 0]}>
                    <mesh><sphereGeometry args={[0.16, 32, 32]} /><meshBasicMaterial color="#aa22ff" /></mesh>
                    <mesh scale={1.6}><sphereGeometry args={[0.16, 24, 24]} /><meshBasicMaterial color="#dd55ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} /></mesh>
                </group>
                {/* Right */}
                <group position={[0.34, 0, 0]}>
                    <mesh><sphereGeometry args={[0.16, 32, 32]} /><meshBasicMaterial color="#aa22ff" /></mesh>
                    <mesh scale={1.6}><sphereGeometry args={[0.16, 24, 24]} /><meshBasicMaterial color="#dd55ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} /></mesh>
                </group>
            </group>

            {/* HAIR PARTICLES */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[hairPositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial color="#e8e8ff" size={0.035} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </points>

            {/* JACKET */}
            <mesh position={[0, 0.9, 0]} rotation={[Math.PI, 0, 0]}>
                <cylinderGeometry args={[1.4, 1.0, 2.5, 48, 1, true]} />
                <IridescentMaterial />
            </mesh>

            {/* INNER SHIRT */}
            <mesh position={[0, 1.3, 0]}>
                <cylinderGeometry args={[1.0, 0.85, 1.2, 32]} />
                <meshStandardMaterial color="#080808" roughness={0.8} />
            </mesh>
        </group>
    );
};

const LoginAvatar: React.FC<LoginAvatarProps> = (props: LoginAvatarProps) => {
    return (
        <Box
            sx={{
                width: 280,
                height: 320,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                background: 'linear-gradient(180deg, #05000f 0%, #0a001a 100%)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <Canvas camera={{ position: [0, 1.6, 7], fov: 45 }}>
                <Suspense fallback={null}>
                    <color attach="background" args={['#05000f']} />
                    <fog attach="fog" args={['#0a001a', 2, 20]} />

                    <ambientLight intensity={0.5} color="#404080" />
                    <pointLight position={[12, 7, -15]} color="#ff00bb" intensity={8} />
                    <pointLight position={[-14, 6, -10]} color="#00ccff" intensity={6} />

                    <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

                    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                        <Character {...props} />
                    </Float>

                    <OrbitControls
                        enablePan={false}
                        enableZoom={false}
                        minPolarAngle={Math.PI / 2.5}
                        maxPolarAngle={Math.PI / 1.5}
                        makeDefault
                    />

                    <Environment preset="city" />
                </Suspense>
            </Canvas>
        </Box>
    );
};

export default LoginAvatar;
