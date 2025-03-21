'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { Slash } from 'lucide-react';
import { Fragment } from 'react';

export function Breadcrumbs() {
  const items = useBreadcrumbs();
  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.title}>
            {/* Desktop View (hidden on small screens) */}
            {index !== items.length - 1 && (
              <BreadcrumbItem className='hidden sm:block'>
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index < items.length - 1 && (
              <BreadcrumbSeparator className='hidden sm:block'>
                <Slash />
              </BreadcrumbSeparator>
            )}

            {/* Mobile View (only show last two items) */}
            {(index >= items.length - 2) && (
              <BreadcrumbItem className='sm:hidden'>
                <BreadcrumbLink href={item.link} className="text-xxs"> {/* Smaller font */}
                  {item.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}

             {/* Mobile Separator (only show between last two) */}
            {(index === items.length - 2) && (
                <BreadcrumbSeparator className='sm:hidden'>
                    <Slash className="size-2"/> {/* potentially smaller slash */}
                </BreadcrumbSeparator>
            )}

            {/*  Always show the last item (current page) */}
             {index === items.length - 1 && (
              <BreadcrumbPage className='hidden sm:block'>{item.title}</BreadcrumbPage> //desktop
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
