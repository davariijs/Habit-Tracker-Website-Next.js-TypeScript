// components/threejs/ClientOnlyFeature.tsx (or .jsx) - Client Component
'use client'; // Correctly placed at the very top

import dynamic from 'next/dynamic';

// Correctly using dynamic import with ssr: false *inside* a Client Component
const ThreeBackground = dynamic(() => import('@/components/threejs/LoginBackground'), {
  ssr: false,
  loading: () => <p>Loading 3D Background...</p>, // Good practice: Add a loading state
});

export default function ClientOnlyFeature() {
  return (
    <div>
      <ThreeBackground />
    </div>
  );
}