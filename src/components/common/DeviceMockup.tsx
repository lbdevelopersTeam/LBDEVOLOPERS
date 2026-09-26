import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, 
  Html, 
  PresentationControls, 
  ContactShadows, 
  Environment,
  PerspectiveCamera,
} from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

interface DeviceMockupProps {
  type: 'laptop' | 'mobile';
  screenImage?: string;
  className?: string;
}

const TerminalUI = () => (
  <div className="w-[1280px] h-[840px] bg-[#0d1117] p-10 font-mono text-zinc-400 overflow-hidden rounded-md border border-white/5 select-none">
    <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-4">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
      </div>
      <div className="text-xs bg-white/5 px-3 py-1 rounded tracking-tight">lb-codebase-studio</div>
    </div>
    <div className="space-y-4">
      <div className="flex gap-6"><span className="text-[#ff7b72]">import</span> <span className="text-[#79c0ff]">React</span> <span className="text-[#ff7b72]">from</span> <span className="text-[#a5d6ff]">'react'</span><span className="text-white">;</span></div>
      <div className="flex gap-6"><span className="text-[#ff7b72]">export const</span> <span className="text-[#d2a8ff]">App</span> <span className="text-white">= () ={`>`} (</span></div>
      <div className="flex gap-6"><span className="ml-8 text-white">{'<'}</span><span className="text-[#7ee787]">div</span> <span className="text-[#79c0ff]">className</span><span className="text-white">="p-4" {`>`}</span></div>
      <div className="flex gap-6"><span className="ml-16 text-white">Digital Excellence</span></div>
      <div className="flex gap-6"><span className="ml-8 text-white">{`</`}</span><span className="text-[#7ee787]">div</span><span className="text-white">{`>`}</span></div>
      <div className="flex gap-6"><span className="text-white">);</span></div>
    </div>
    <div className="mt-20 border-t border-white/5 pt-6 flex gap-3 text-sm">
      <span className="text-[#27c93f]">➜</span> <span className="text-[#79c0ff]">main</span> <span className="animate-pulse">_</span>
    </div>
  </div>
);

const ProceduralLaptop = ({ screenImage }: { screenImage?: string }) => {
  return (
    <group rotation={[0, -0.4, 0]}>
      {/* Base */}
      <mesh position={[0, -1.8, 0]}>
        <boxGeometry args={[6.4, 0.15, 4.4]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Screen Mesh */}
      <group position={[0, -1.75, -2.1]} rotation={[-0.1, 0, 0]}>
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[6.3, 4.2, 0.1]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
          
          <mesh position={[0, 0, 0.051]}>
             <planeGeometry args={[6, 4]} />
             <meshStandardMaterial color="#000" />
          </mesh>

          <Html
            transform
            distanceFactor={3.6}
            position={[0, 0, 0.06]}
            occlude
          >
            <div className="w-[1280px] h-auto aspect-video bg-zinc-900 overflow-hidden rounded-sm border border-white/5 select-none">
              {screenImage ? (
                <img src={screenImage} alt="Screen Content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <TerminalUI />
              )}
            </div>
          </Html>
        </mesh>
      </group>
    </group>
  );
};

const ProceduralMobile = ({ screenImage }: { screenImage?: string }) => {
  return (
    <group rotation={[0, 0.2, 0]}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[2.2, 4.5, 0.15]} />
        <meshStandardMaterial color="#151515" metalness={0.8} roughness={0.2} />
        
        {/* Screen/Display Area */}
        <Html
          transform
          distanceFactor={2.4}
          position={[0, 0, 0.09]}
          occlude
        >
          <div className="w-[375px] h-auto aspect-[9/19.5] bg-zinc-900 overflow-hidden rounded-[40px] select-none border border-white/10">
            {screenImage ? (
              <img 
                src={screenImage} 
                alt="Mobile Content" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="w-12 h-12 bg-brand-primary rounded-full mb-6 animate-pulse" />
                <div className="h-2 w-32 bg-white/10 rounded-full mb-2" />
                <div className="h-2 w-20 bg-white/10 rounded-full" />
              </div>
            )}
          </div>
        </Html>
      </mesh>
      
      {/* Dynamic Notch */}
      <mesh position={[0, 2.1, 0.08]}>
         <boxGeometry args={[0.8, 0.1, 0.02]} />
         <meshStandardMaterial color="#000" />
      </mesh>
    </group>
  );
};

export default function DeviceMockup({ type, screenImage, className }: DeviceMockupProps) {
  return (
    <div className={cn('relative w-full aspect-square md:aspect-video', className)}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 45 }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#f27d26" />
          <PresentationControls global rotation={[0, 0, 0]} polar={[-Math.PI / 10, Math.PI / 10]} azimuth={[-Math.PI / 6, Math.PI / 6]} snap>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              {type === 'laptop' ? <ProceduralLaptop screenImage={screenImage} /> : <ProceduralMobile screenImage={screenImage} />}
            </Float>
          </PresentationControls>
          <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2.4} far={4.5} />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-primary/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
