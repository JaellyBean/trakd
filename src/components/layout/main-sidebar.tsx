'use client';

import {
  Bell,
  Cog,
  Globe,
  Plus,
  Users,
  LogOut,
  AreaChart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { UserButton } from '../auth/user-button';
import { auth } from '@/lib/firebase';

const NAV_LINKS = [
  { href: '/map', icon: Globe, label: 'Map' },
  { href: '/groups', icon: Users, label: 'Groups' },
  { href: '/activity', icon: AreaChart, label: 'Activity' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/settings', icon: Cog, label: 'Settings' },
];

export function MainSidebar() {
  const { user, trakdUser } = useAuth();
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-20 flex-col items-center border-r bg-background py-4">
      <div className="flex flex-col items-center gap-4">
        <Link
          href="/map"
          className="mb-4 text-primary"
          aria-label="Trak'd Home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </Link>
        {NAV_LINKS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg p-3 ${
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
            aria-label={label}
          >
            <Icon className="h-6 w-6" />
          </Link>
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center gap-4">
        <Button variant="outline" size="icon" aria-label="Create Group">
          <Plus className="h-6 w-6" />
        </Button>
        <div className="h-12 w-12">
          {user && trakdUser && (
            <UserButton user={user} trakdUser={trakdUser} />
          )}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Sign Out">
              <LogOut className="h-6 w-6 text-muted-foreground" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be returned to the sign-in page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => auth.signOut()}>
                Sign Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
