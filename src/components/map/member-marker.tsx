'use client';

import { formatDistanceToNow } from 'date-fns';
import { Battery, BatteryCharging } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { TrakdUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface MemberMarkerProps {
  member: TrakdUser;
  isCurrentUser?: boolean;
}

export function MemberMarker({ member, isCurrentUser = false }: MemberMarkerProps) {
  const getAvatarFallback = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  const lastSeen = member.location?.timestamp
    ? formatDistanceToNow(member.location.timestamp.toDate(), { addSuffix: true })
    : 'Never';

  const batteryLevel = member.battery ? member.battery.level * 100 : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none">
          <Avatar
            className={cn(
              'h-12 w-12 border-4 transition-all hover:scale-110',
              isCurrentUser ? 'border-primary' : 'border-card'
            )}
          >
            <AvatarImage src={member.photoURL || ''} alt={member.displayName || ''} />
            <AvatarFallback>
              {getAvatarFallback(member.displayName)}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={member.photoURL || ''} alt={member.displayName || ''} />
              <AvatarFallback>
                {getAvatarFallback(member.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
              <p className="truncate font-headline font-semibold">{member.displayName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {isCurrentUser ? 'You' : 'Group Member'}
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last seen</span>
              <span className="font-medium">{lastSeen}</span>
            </div>
            {batteryLevel !== null && (
              <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Battery</span>
                 <div className="flex items-center gap-2 font-medium">
                    {member.battery?.charging ? <BatteryCharging className="h-4 w-4 text-green-500"/> : <Battery className="h-4 w-4"/>}
                    <span>{batteryLevel.toFixed(0)}%</span>
                 </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
