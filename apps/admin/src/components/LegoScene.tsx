'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { memo, useMemo, useRef } from 'react';

type LegoBrickConfig = {
  color: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  speed: number;
  phase: number;
};

type FloatingGroup = {
  position: {
    x: number;
    y: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
};

const LEGO_BRICKS: LegoBrickConfig[] = [
  {
    color: '#E94B5A',
    position: [-4.85, 0.72, -0.45],
    rotation: [0.22, 0.48, -0.2],
    scale: [1.42, 0.66, 0.96],
    speed: 0.28,
    phase: 0.2,
  },
  {
    color: '#4DA3FF',
    position: [4.65, 2.25, -0.8],
    rotation: [-0.18, -0.52, 0.2],
    scale: [1.48, 0.68, 0.98],
    speed: 0.22,
    phase: 1.4,
  },
  {
    color: '#F5C542',
    position: [3.95, -2.28, -0.55],
    rotation: [0.3, -0.25, 0.28],
    scale: [1.18, 0.56, 0.86],
    speed: 0.24,
    phase: 2.2,
  },
  {
    color: '#FFFFFF',
    position: [-1.25, -2.68, -0.45],
    rotation: [-0.38, 0.28, -0.1],
    scale: [0.92, 0.48, 0.7],
    speed: 0.18,
    phase: 3.1,
  },
  {
    color: '#B9DFF7',
    position: [0.25, 2.65, -1.65],
    rotation: [0.2, 0.75, 0.16],
    scale: [0.9, 0.48, 0.66],
    speed: 0.2,
    phase: 4.2,
  },
  {
    color: '#FFFFFF',
    position: [-3.8, 2.7, -1.25],
    rotation: [0.1, -0.22, 0.34],
    scale: [0.76, 0.42, 0.62],
    speed: 0.16,
    phase: 5.1,
  },
];

function LegoBrick({ color, position, rotation, scale, speed, phase }: LegoBrickConfig) {
  const groupRef = useRef<FloatingGroup | null>(null);
  const studs = useMemo(
    () =>
      [
        [-0.28, 0.31, -0.2],
        [0.28, 0.31, -0.2],
        [-0.28, 0.31, 0.2],
        [0.28, 0.31, 0.2],
      ] as const,
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const elapsed = clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(elapsed * speed + phase) * 0.22;
    groupRef.current.position.x = position[0] + Math.cos(elapsed * speed * 0.72 + phase) * 0.08;
    groupRef.current.rotation.x = rotation[0] + Math.sin(elapsed * speed * 0.58 + phase) * 0.08;
    groupRef.current.rotation.y = rotation[1] + elapsed * speed * 0.1;
    groupRef.current.rotation.z = rotation[2] + Math.cos(elapsed * speed * 0.48 + phase) * 0.06;
  });

  return (
    <group
      ref={(node) => {
        groupRef.current = node;
      }}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.58, 0.86]} />
        <meshStandardMaterial color={color} metalness={0.08} roughness={0.36} />
      </mesh>
      {studs.map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, y, z]}>
          <boxGeometry args={[0.24, 0.13, 0.24]} />
          <meshStandardMaterial color={color} metalness={0.06} roughness={0.34} />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent() {
  return (
    <group>
      <ambientLight intensity={0.74} />
      <directionalLight color='#B9DFF7' intensity={1.35} position={[-3.8, 4.6, 5.4]} />
      <pointLight color='#F5C542' intensity={2.8} position={[3.4, -2.8, 3.8]} />
      <pointLight color='#4DA3FF' intensity={1.45} position={[-3.2, 2.7, 2.4]} />
      {LEGO_BRICKS.map((brick) => (
        <LegoBrick key={`${brick.color}-${brick.phase}`} {...brick} />
      ))}
    </group>
  );
}

function LegoScene() {
  return (
    <div className='absolute inset-0 h-full w-full overflow-hidden'>
      <Canvas
        camera={{ fov: 38, position: [0, 0, 8.5] }}
        className='pointer-events-none h-full w-full'
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        shadows={false}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

export default memo(LegoScene);
