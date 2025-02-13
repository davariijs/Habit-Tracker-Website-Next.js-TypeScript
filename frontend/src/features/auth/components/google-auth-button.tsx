'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import GoogleIcon from '@mui/icons-material/Google';
import { IconButton } from '@mui/material';

export default function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  return (
    <Button
      className='w-full'
      variant='outline'
      type='button'
      onClick={() =>
        signIn('google', { callbackUrl: callbackUrl ?? '/dashboard' })
      }
    >
      <GoogleIcon sx={{width:'16px', height:'16px'}}/>
      <div className='ml-2'>Continue with Google</div>
    </Button>
  );
}
