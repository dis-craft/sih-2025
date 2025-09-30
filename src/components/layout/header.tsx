'use client';

import { Train } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';
import { useSidebar, SidebarTrigger } from '../ui/sidebar';

const navItems = [
    { href: '/simulation/sbc-mys?case=case1', label: 'SBC-MYS' },
];

export function Header({ sectionName }: { sectionName: string }) {
  const { isMobile } = useSidebar();
  
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
         <h1 className="text-lg font-semibold md:text-xl">RailOptix</h1>
      </div>
      
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className='ml-auto text-right'>
            <h2 className="text-md font-semibold md:text-lg">{sectionName}</h2>
            <p className="text-xs text-muted-foreground">Section Controller Dashboard</p>
        </div>
      </div>
    </header>
  );
}
