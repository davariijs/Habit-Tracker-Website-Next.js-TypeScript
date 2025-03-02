"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { useRef, Suspense, useEffect, useState } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  children?: React.ReactNode;
}

const RotatingObject = () => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * delta * 60;
      meshRef.current.rotation.x += 0.002 * delta * 60;
    }
  });

  const [colorMap, normalMap, displacementMap, roughnessMap, aoMap] = useTexture([
    '/textures/lavatileable/lavatileable1_Base_Color.png',
    '/textures/lavatileable/lavatileable1_Normal.png',
    '/textures/lavatileable/lavatileable1_Height.png',
    '/textures/lavatileable/lavatileable1_Roughness.png',
    '/textures/lavatileable/lavatileable1_Ambient_Occlusion.png',
  ]);

  return (
    <mesh ref={meshRef} scale={1.5}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        displacementMap={displacementMap}
        displacementScale={0.1}
        roughnessMap={roughnessMap}
        roughness={0.8}
        aoMap={aoMap}
      />
    </mesh>
  );
};

// Define a separate component for the background mesh *and* its useFrame logic.
const BackgroundMesh = () => {
  const shaderRef = useRef<THREE.ShaderMaterial>(null!);

    useFrame(({ clock }) => {
        if (shaderRef.current) {
            shaderRef.current.uniforms.iTime.value = clock.elapsedTime;
        }
    });

    // Use a custom shader for the background gradient
  const gradientShader = {
    uniforms: {
      iTime: { value: 0 },
      uColor1: { value: new THREE.Color(0x000000) }, // Black
      uColor2: { value: new THREE.Color(0x00008B) }, // Dark Blue - Change as desired
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float iTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      varying vec2 vUv;

      void main() {
        // Simple linear gradient from bottom to top
        vec3 color = mix(uColor1, uColor2, vUv.y);

        // Add a subtle pulsing effect (optional)
        float pulse = sin(iTime * 0.5) * 0.1 + 0.9; // Pulse between 0.9 and 1.0
        color *= pulse;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  };
  return (
    <mesh>
      <planeGeometry args={[100, 100]} /> {/* Large plane */}
      <shaderMaterial
        ref={shaderRef}
        {...gradientShader}
        side={THREE.DoubleSide} // Ensure it's visible from both sides
      />
    </mesh>
  )
}

const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ children }) => {
  //const shaderRef = useRef<THREE.ShaderMaterial>(null!); // Moved to BackgroundMesh

  // Use a custom shader for the background gradient -- MOVED to BackgroundMesh
  /*const gradientShader = {
   ...
  };*/

    // useFrame(({ clock }) => { MOVED to BackgroundMesh
    //     if (shaderRef.current) {
    //         shaderRef.current.uniforms.iTime.value = clock.elapsedTime;
    //     }
    // });
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          background: "black", // Still good to have
        }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight
            color="#ffffff"
            intensity={0.8}
            position={[5, 5, 5]}
            castShadow
          />
          <pointLight position={[-5, 5, -5]} intensity={0.5} color="blue" />

          <Stars radius={50} depth={20} count={2000} factor={4} saturation={1} fade speed={1} />

          <RotatingObject />

          {/* Background Plane with Custom Shader */}
          <BackgroundMesh/>

          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.2} enableRotate={false} />
        </Suspense>
      </Canvas>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        zIndex: 1,
        textAlign: 'center',
        width: '80%',
        maxWidth: '400px'
      }}>
        {children}
      </div>
    </div>
  );
};

export default ThreeBackground;