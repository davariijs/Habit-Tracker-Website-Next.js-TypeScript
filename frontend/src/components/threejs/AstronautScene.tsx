// pages/astronaut.tsx
"use client";
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const AstronautPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    // Check if containerRef is current.  Important for avoiding errors during unmounting.
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // For sharper rendering on high-DPI displays
    renderer.setClearColor(0x000000); // Set background color to black
    containerRef.current.appendChild(renderer.domElement);

    // --- Orbit Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Add damping for smoother camera movement
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 2;  // Limit how far you can zoom in
    controls.maxDistance = 10; // Limit how far you can zoom out
    controls.maxPolarAngle = Math.PI / 2; // Limit vertical rotation to prevent going under the "floor"


    // --- Lighting ---
    // Ambient light for overall scene illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light, simulating the sun
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1); // Position the light
    scene.add(directionalLight);

    // --- Load the Astronaut Model ---
    const loader = new GLTFLoader();
    let astronautModel: THREE.Group; // Store the model globally within the useEffect scope

    loader.load(
      '/astronaut.glb', //  Path to your GLB file.  Place it in the /public folder.
      (gltf) => {
        astronautModel = gltf.scene;
        scene.add(astronautModel);

        // --- Material Setup (Iridescent Effect) ---
        astronautModel.traverse((child) => {
           // Check if the child is a mesh before applying material changes
          if (child instanceof THREE.Mesh) {
            // Use MeshPhysicalMaterial for better reflections and refractions
            child.material = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,       // Base color (white)
              metalness: 0.9,        // High metalness for reflectivity
              roughness: 0.1,        // Low roughness for a smooth, mirror-like surface
              clearcoat: 1.0,        // Add a clearcoat layer for extra shine
              clearcoatRoughness: 0.1, // Smooth clearcoat
              reflectivity: 1.0,      // High reflectivity
              envMap: getEnvironmentMap(),  // Apply the environment map for reflections
              envMapIntensity: 1.0,   // Control the intensity of the environment map
            });
          }
        });

        // --- Positioning and Scaling ---
        astronautModel.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
        astronautModel.position.set(0, -1, 0);   // Center and lower the model slightly
        astronautModel.rotation.y = Math.PI / 4; // Rotate slightly

        setLoading(false); // Model is loaded
      },
      (xhr) => {
        // Progress callback (optional)
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        // Error callback
        console.error('An error happened', error);
        setLoading(false); // Set loading to false even on error to prevent infinite spinner
      }
    );

    // --- Create Ground Plane with Lines ---
    const planeGeometry = new THREE.PlaneGeometry(10, 10, 20, 20); // Increased segments for more lines
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000, // Black color
      wireframe: true, // Render as wireframe to show the lines
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to lie flat
    plane.position.y = -1.5;       // Position below the astronaut
    scene.add(plane);



    // --- Camera Positioning ---
    camera.position.z = 5;

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update orbit controls
      renderer.render(scene, camera);
    };

    animate();

    // --- Window Resize Handling ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener('resize', handleResize);
      // Dispose of resources to prevent memory leaks
      renderer.dispose();
      controls.dispose();
      // Additional cleanup for materials, geometries, and textures if necessary
    };
  }, []);

    // --- Environment Map Function ---
    function getEnvironmentMap() {
      const textureLoader = new THREE.CubeTextureLoader();
      const envMap = textureLoader.load([
        '/px.png', // Positive X
        '/nx.png', // Negative X
        '/py.png', // Positive Y
        '/ny.png', // Negative Y
        '/pz.png', // Positive Z
        '/nz.png', // Negative Z
      ]);
      // Place these 6 images in public folder
      return envMap;
    }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
        }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default AstronautPage;