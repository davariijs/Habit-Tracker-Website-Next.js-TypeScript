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
            <Button onClick={handleShowLoginForm} className='ml-auto w-full bg-color-dark text-white   hover:text-black' type='button'>
              Login
            </Button>
            <Button onClick={handleShowRegisterForm} className='ml-auto w-full bg-blue-600 text-white  hover:text-black' type='button'>
              Register
            </Button>
          </>
        )}
  
        {showLoginForm && (
          <>
            <UserAuthForm />
            <Button onClick={handleShowRegisterForm} variant="link" className="px-0 text-xs mt-2 lg:text-sm text-muted-foreground">
              Create new account
            </Button>
          </>
        )}
  
        {showRegisterForm && (
          <>
            <UserRegisterForm />
            <Button onClick={handleShowLoginForm} variant="link" className="px-0 text-xs mt-2 lg:text-sm text-muted-foreground">
              Already have an account?
            </Button>
          </>
        )}
      </>
    );
  }
