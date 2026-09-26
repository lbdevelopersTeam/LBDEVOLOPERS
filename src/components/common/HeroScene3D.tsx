import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const useMobile3DFallback = () => {
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)');
    const update = () => setFallback(media.matches || document.documentElement.dataset.quality === 'low');
    update();
    media.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-quality'] });
    return () => {
      media.removeEventListener('change', update);
      observer.disconnect();
    };
  }, []);

  return fallback;
};

const CameraRig = ({ lightRef }: { lightRef: React.RefObject<THREE.PointLight | null> }) => {
  const { camera } = useThree();
  const progress = useRef(0);
  const pointer = useRef(new THREE.Vector3(0, 0, 5));
  const targetLight = useRef(new THREE.Vector3(0, 0, 5));

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: '#home-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });

    const handlePointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 8;
      const y = -(event.clientY / window.innerHeight - 0.5) * 5;
      targetLight.current.set(x, y, 4);
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => {
      trigger.kill();
      window.removeEventListener('pointermove', handlePointer);
    };
  }, []);

  useFrame((_state, delta) => {
    const eased = THREE.MathUtils.smoothstep(progress.current, 0, 1);
    camera.position.lerp(new THREE.Vector3(0, Math.sin(eased * Math.PI) * 1.4, 15 - eased * 13), Math.min(delta * 3, 1));
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, eased * 0.08, Math.min(delta * 2, 1));
    camera.lookAt(0, 0, -8);

    if (lightRef.current) {
      pointer.current.lerp(targetLight.current, 0.1);
      lightRef.current.position.copy(pointer.current);
    }
  });

  return null;
};

const ParticleTunnel = ({ count }: { count: number }) => {
  const points = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const angle = index * 0.18;
      const radius = 4 + Math.sin(index * 0.09) * 1.8 + Math.random() * 1.5;
      const depth = -index * 0.045;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = Math.sin(angle) * radius;
      positions[index * 3 + 2] = depth;

      const color = new THREE.Color(index % 2 === 0 ? '#3D5AFE' : '#00E5FF');
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, [count]);

  useEffect(() => {
    return () => {
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, []);

  useFrame((_state, delta) => {
    if (!points.current) return;
    points.current.rotation.z += delta * 0.05;
    points.current.position.z = Math.sin(_state.clock.elapsedTime * 0.35) * 0.8;
  });

  return (
    <points ref={points} frustumCulled>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} size={0.045} vertexColors transparent opacity={0.72} sizeAttenuation depthWrite={false} />
    </points>
  );
};

const AbstractCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.IcosahedronGeometry>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    return () => {
      geometryRef.current?.dispose();
      materialRef.current?.dispose();
    };
  }, []);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.12;
    meshRef.current.rotation.y += delta * 0.18;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -4]} frustumCulled>
      <icosahedronGeometry ref={geometryRef} args={[2.6, 1]} />
      <meshStandardMaterial ref={materialRef} color="#111936" wireframe transparent opacity={0.22} metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

function Scene({ quality }: { quality: 'high' | 'medium' | 'low' }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const particleCount = quality === 'high' ? 2600 : quality === 'medium' ? 1400 : 700;

  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.25} />
      <pointLight ref={lightRef} position={[0, 0, 5]} intensity={2.2} color="#3D5AFE" distance={18} />
      <pointLight position={[-8, -6, -8]} intensity={0.9} color="#7C4DFF" />
      <CameraRig lightRef={lightRef} />
      <Stars radius={60} depth={40} count={quality === 'high' ? 2600 : 900} factor={4} saturation={0} fade speed={0.5} />
      <ParticleTunnel count={particleCount} />
      <AbstractCore />
    </>
  );
}

export default function HeroScene3D() {
  const fallback = useMobile3DFallback();
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  useEffect(() => {
    const updateQuality = () => {
      const htmlQuality = document.documentElement.dataset.quality;
      if (htmlQuality === 'low') setQuality('low');
      else if (window.devicePixelRatio > 1.5) setQuality('medium');
      else setQuality('high');
    };
    updateQuality();
    const observer = new MutationObserver(updateQuality);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-quality'] });
    return () => observer.disconnect();
  }, []);

  if (fallback) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(61,90,254,0.12),transparent_35%),radial-gradient(circle_at_75%_65%,rgba(0,229,255,0.07),transparent_35%)]" />
        <div className="absolute left-1/2 top-1/2 h-[70vw] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-primary/10 animate-[spin_18s_linear_infinite]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }} dpr={[1, quality === 'high' ? 1.5 : 1]}>
        <Scene quality={quality} />
      </Canvas>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-transparent to-transparent" />
    </div>
  );
}
