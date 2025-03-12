'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useState } from 'react';
import { CircularProgress } from '@mui/material';

export default function GithubSignInButton() {
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
          await signIn('github', { 
            callbackUrl: callbackUrl ?? '/dashboard'
          });
        } catch (error) {
          console.error('GitHub sign-in error:', error);
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <CircularProgress size={20} color="inherit" />
        ) : (
        <div className='flex'>
        <Icons.gitHub className='mr-2 h-4 w-4' />
        Github
        </div>
      )}
      
    </Button>
  );
}
