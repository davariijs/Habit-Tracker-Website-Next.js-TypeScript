'use client'
import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import { UserNav } from './user-nav';
import ThemeToggle from './ThemeToggle/theme-toggle';
import NotificationHandler from '../notification/NotificationHandler';
import NotificationChecker from '../notification/NotificationChecker';
import NotificationToggle from '../notification/NotificationToggle';

export default function Header() {
  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs />
        <NotificationHandler/>
        <NotificationChecker/>
      </div>

      <div className='flex items-center gap-3 px-4'>
        <div className='mr-3'>
        <NotificationToggle />
        </div>
        <UserNav />
        <ThemeToggle />
      </div>
    </header>
  );
}
