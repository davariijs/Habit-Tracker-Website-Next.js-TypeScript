import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className='w-full'>
          <div className='p-4 md:px-6'>{children}</div> 
        </ScrollArea>
      ) : (
        <div className='p-4 md:px-6'>{children}</div>
      )}
    </>
  );
}