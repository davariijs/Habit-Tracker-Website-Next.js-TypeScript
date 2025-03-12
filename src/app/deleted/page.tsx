
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountDeleted() {
  const router = useRouter();
  
  useEffect(() => {
    window.history.pushState(null, '', '/deleted');
    window.history.replaceState(null, '', '/deleted');
    
    const preventNavigation = (e: PopStateEvent) => {
      window.history.pushState(null, '', '/deleted');
      e.stopPropagation();
    };
    
    localStorage.clear();
    sessionStorage.clear();
    
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, 
        "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    window.addEventListener('popstate', preventNavigation);
    
    return () => {
      window.removeEventListener('popstate', preventNavigation);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-md text-center text-black">
        <h1 className="text-2xl font-bold">Account Deleted</h1>
        <p className="mt-4">
          Your account has been permanently deleted along with all your data.
        Thank you for using our app.
        </p>
        <div className="mt-6">
          <Link 
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => {
              window.history.pushState(null, '', '/');
            }}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}