'use client';

import {
  LogOut,
  Map,
  Users,
  User,
  MapPin,
  LoaderCircle,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { auth } from '@/lib/firebase';
import { Skeleton } from '../ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    href: '/map',
    label: 'Map',
    icon: Map,
  },
  {
    href: '/groups',
    label: 'Groups',
    icon: Users,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

function BottomNavBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around h-16">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-full text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}


export function AppSidebar() {
  const pathname = usePathname();
  const { trakdUser, loading } = useAuth();
  const isMobile = useIsMobile();

  const getAvatarFallback = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  if (isMobile) {
    return <BottomNavBar />;
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="font-headline text-xl font-semibold">Trak'd</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{
                    children: item.label,
                  }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        {loading ? (
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : trakdUser ? (
          <div className="flex items-center gap-3 p-2">
            <Avatar>
              <AvatarImage src={trakdUser.photoURL || ''} alt={trakdUser.displayName || ''} />
              <AvatarFallback>
                {getAvatarFallback(trakdUser.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
              <p className="truncate font-semibold">{trakdUser.displayName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {trakdUser.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => auth.signOut()}
              className="flex-shrink-0"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-2">
            <LoaderCircle className="animate-spin" />
          </div>
        )}
      </SidebarFooter>
    </>
  );
}
