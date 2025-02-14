'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import GoogleIcon from '@mui/icons-material/Google';

export default function GoogleSignInButton() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const handleGoogleSignIn = () => {
    console.log('Callback URL:', callbackUrl);
    signIn('google', { callbackUrl: callbackUrl ?? '/dashboard' });
  };

  return (
    <Button
      className='w-full'
      variant='outline'
      type='button'
      onClick={handleGoogleSignIn}
    >
      <GoogleIcon sx={{width:'16px', height:'16px'}}/>
      <div className='ml-2'>Continue with Google</div>
    </Button>
  );
}
