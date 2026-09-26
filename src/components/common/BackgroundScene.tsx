import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';
import { useScroll as useFramerScroll, useTransform, animate, useMotionValue } from 'framer-motion';

const TerminalUI = () => {
  return (
    <div className="w-[1280px] h-[840px] bg-[#0d1117] p-10 font-mono text-zinc-400 overflow-hidden rounded-md border border-white/5 select-none">
      <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-4">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="text-xs bg-white/5 px-3 py-1 rounded">~/projects/lb-codebase/src/App.tsx</div>
      </div>
      <div className="space-y-4">
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">1</span>
          <span className="text-[#ff7b72]">import</span> <span className="text-[#79c0ff]">React</span> <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'react'</span><span className="text-white">;</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">2</span>
          <span className="text-[#ff7b72]">import</span> <span className="text-white">{`{ motion }`}</span> <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'framer-motion'</span><span className="text-white">;</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">3</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">4</span>
          <span className="text-[#ff7b72]">export const</span> <span className="text-[#d2a8ff]">Hero</span> <span className="text-white">= () ={`>`} (</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">5</span>
          <span className="ml-8 text-white">{'<'}</span><span className="text-[#7ee787]">motion.div</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">6</span>
          <span className="ml-16 text-[#79c0ff]">initial</span><span className="text-white">={`{ { opacity: 0 } }`}</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">7</span>
          <span className="ml-16 text-[#79c0ff]">animate</span><span className="text-white">={`{ { opacity: 1 } }`}</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">8</span>
          <span className="ml-8 text-white">{`/>`}</span>
        </div>
        <div className="flex gap-6">
          <span className="text-zinc-600 w-10 text-right">9</span>
          <span className="text-white">{`);`}</span>
        </div>
      </div>
      <div className="mt-20 border-t border-white/5 pt-6 bg-black/20 -mx-10 px-10">
        <div className="flex gap-3 text-sm">
          <span className="text-[#27c93f]">➜</span>
          <span className="text-[#79c0ff]">lb-codebase</span>
          <span className="text-zinc-500">git:(</span><span className="text-[#ff7b72]">main</span><span className="text-zinc-500">)</span>
          <span className="text-white animate-pulse">_</span>
        </div>
      </div>
    </div>
  );
};

const ProceduralLaptop = ({ opacity }: { opacity: any }) => {
  return (
    <group>
      {/* Base / Body */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[6.4, 0.15, 4.4]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.9} roughness={0.1} transparent opacity={opacity} />
      </mesh>
      
      {/* Screen Lid */}
      <group position={[0, -1.75, -2.1]} rotation={[-0.1, 0, 0]}>
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[6.3, 4.2, 0.1]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} transparent opacity={opacity} />
          
          <mesh position={[0, 0, 0.051]}>
            <planeGeometry args={[6, 4]} />
            <meshStandardMaterial color="#000" transparent opacity={opacity} />
          </mesh>

          <Html
            transform
            distanceFactor={3.6}
            position={[0, 0, 0.06]}
            occlude
          >
            <div style={{ opacity: opacity }}>
               <TerminalUI />
            </div>
          </Html>
        </mesh>
      </group>
    </group>
  );
};

const LaptopModel = ({ scrollProgress }: { scrollProgress: any }) => {
  const meshRef = useRef<THREE.Group>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const opacityVal = useMotionValue(1);

  useEffect(() => {
    animate(opacityVal, isHome ? 1 : 0, { duration: 1 });
  }, [isHome]);

  // Adjusted scroll mapping for precise landing and exit
  // Section 1 (Hero): 0 -> 0.15
  // Transition: 0.15 -> 0.3
  // Section 2 (Innovation): 0.3 -> 0.45
  // Exit: 0.45 -> 0.55 (to avoid "cringe" in later sections)
  
  const posX = useTransform(scrollProgress, [0, 0.15, 0.3, 0.45, 0.55], [3.2, 3.2, -4.8, -4.8, -5]);
  const posY = useTransform(scrollProgress, [0, 0.15, 0.3, 0.45, 0.55], [0, 0, 0, 0, -8]);
  const rotY = useTransform(scrollProgress, [0, 0.15, 0.3, 0.45, 0.55], [-0.5, -0.4, 0.7, 0.7, 0.8]);
  const scale = useTransform(scrollProgress, [0, 0.15, 0.3, 0.45, 0.55], [1.1, 1.1, 1.1, 1.1, 0.5]);
  const exitOpacity = useTransform(scrollProgress, [0.4, 0.5], [1, 0]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.position.x = posX.get();
    meshRef.current.position.y = posY.get();
    meshRef.current.rotation.y = rotY.get();
    const s = scale.get();
    meshRef.current.scale.set(s, s, s);
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <ProceduralLaptop opacity={opacityVal.get() * exitOpacity.get()} />
      </Float>
    </group>
  );
};

export default function BackgroundScene() {
  const { scrollYProgress } = useFramerScroll();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 10], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f27d26" />
          <LaptopModel scrollProgress={scrollYProgress} />
          <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={40} blur={2.5} far={10} />
        </Suspense>
      </Canvas>
    </div>
  );
}
