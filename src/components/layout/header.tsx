'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';

type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-card">
      <div className="flex items-center gap-4 md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold md:text-xl text-foreground ml-4 md:ml-0">
        {title}
      </h1>
    </header>
  );
}
