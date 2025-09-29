'use client';

import { Train, Menu } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Link from 'next/link';

const navItems = [
    { href: '/simulation/ksr-central', label: 'KSR Central' },
    { href: '/simulation/sbc-mys', label: 'SBC-MYS' },
];

export function Header({ sectionName }: { sectionName: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Train className="h-6 w-6 text-primary" />
          <span className="sr-only">RailSectionSim</span>
        </Link>
        {navItems.map((item) => (
            <Link
            key={item.href}
            href={item.href}
            className={`transition-colors hover:text-foreground ${item.label === sectionName ? 'text-foreground' : 'text-muted-foreground'}`}
            >
            {item.label}
            </Link>
        ))}

      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Train className="h-6 w-6 text-primary" />
              <span className="sr-only">RailSectionSim</span>
            </Link>
            {navItems.map((item) => (
            <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground ${item.label === sectionName ? 'text-foreground' : 'text-muted-foreground'}`}
            >
                {item.label}
            </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className='ml-auto'>
            <h1 className="text-lg font-semibold md:text-xl">{sectionName}</h1>
            <p className="text-sm text-muted-foreground">Section Controller Dashboard</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="@shadcn" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Anand Kumar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
