'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import { CircularProgress } from '@mui/material';

export default function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Button
      className='w-full'
      variant='outline'
      type='button'
      onClick={async () => {
        try {
          setLoading(true);
          await signIn('google', { 
            callbackUrl: callbackUrl ?? '/dashboard'
          });
        } catch (error) {
          console.error('Google sign-in error:', error);
          setLoading(false);
        }
      }}
    >
      {loading ? (
              <CircularProgress size={20} color="inherit" />
              ) : (
              <div className='flex'>
              <GoogleIcon sx={{width:'16px', height:'16px'}}/>
              <div className='ml-2'>Google</div>
              </div>
            )}
      
    </Button>
  );
}
