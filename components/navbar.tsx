'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuGroup } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import SignOutButton from './sign-out-btn';
import { useSession } from '@/lib/auth/auth-client';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold text-primary tracking-tight">
          <Briefcase />
          <span>Job Tracker</span>
        </Link>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-gray-200 transition-all">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary font-semibold text-white">
                          {session.user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button
                  variant='ghost'
                  className="text-sm font-medium shadow-sm">
                  Log In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-primary hover:bg-primary/90 text-sm font-medium transition-all">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}