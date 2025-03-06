import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import LoginAuth from './login-auth';
import  Calendar from '../../../../public/images/calendar.png';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='relative bg-color-dark h-screen flex-col items-center justify-center  lg:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 hidden md:right-8 md:top-8'
        )}
      >
        Login
      </Link>
      <div className='relative bg-color-dark h-1/3 lg:h-full flex flex-col items-center justify-center self-center p-10 text-white dark:border-r '>
        <h1 className='lg:text-6xl text-3xl font-extrabold lg:mt-0 mt-10'>Habit Tracker!</h1>
        <p className='lg:text-2xl text-base lg:my-12 my-4'>Track. Improve. Repeat.</p>
        <Image src={Calendar} alt='calendar' className='lg:w-72 w-32'/>
        
      </div>
      <div className='flex h-full lg:mt-0 mt-10 items-center p-10 lg:p-8 lg:rounded-tl-wwl lg:rounded-bl-wwl rounded-tr-wwl lg:rounded-tr-none bg-background'>
        <div className='mx-auto -mt-72 lg:mt-0 flex w-full flex-col justify-center space-y-2 lg:space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='lg:text-2xl text-lg font-semibold tracking-tight'>
            Start tracking your habits today!
            </h1>
          </div>
          <LoginAuth/>
        </div>
      </div>
    </div>
  );
}
