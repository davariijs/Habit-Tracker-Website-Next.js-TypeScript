'use client';
import { Button } from '@/components/ui/button';
import { useState} from 'react'; 
import UserAuthForm from './user-auth-form';
import UserRegisterForm from './user-register-form';


export default function LoginAuth() {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
  
    const handleShowLoginForm = () => {
      setShowLoginForm(true);
      setShowRegisterForm(false);
    };
  
    const handleShowRegisterForm = () => {
      setShowLoginForm(false);
      setShowRegisterForm(true);
    };
  
    return (
      <>
        {!showLoginForm && !showRegisterForm && (
          <>
            <Button onClick={handleShowLoginForm} className='ml-auto w-full' type='button'>
              Login
            </Button>
            <Button onClick={handleShowRegisterForm} className='ml-auto w-full' type='button'>
              Register
            </Button>
          </>
        )}
  
        {showLoginForm && (
          <>
            <UserAuthForm />
            <Button onClick={handleShowRegisterForm} variant="link" className="px-0 mt-2 text-sm text-muted-foreground">
              Create new account
            </Button>
          </>
        )}
  
        {showRegisterForm && (
          <>
            <UserRegisterForm />
            <Button onClick={handleShowLoginForm} variant="link" className="px-0 mt-2 text-sm text-muted-foreground">
              Already have an account?
            </Button>
          </>
        )}
      </>
    );
  }
