'use client';

import { Copy, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import type { Group } from '@/lib/types';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface GroupCardProps {
  group: Group;
  userId: string;
  onLeave: (groupId: string) => Promise<void>;
}

export function GroupCard({ group, userId, onLeave }: GroupCardProps) {
  const { toast } = useToast();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(group.inviteCode);
    toast({
      title: 'Copied!',
      description: 'Invite code has been copied to your clipboard.',
    });
  };
  
  const isOwner = group.ownerId === userId;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                    <UserIcon className="h-4 w-4" /> {group.members.length} member(s)
                </CardDescription>
            </div>
            {isOwner && <Badge>Owner</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Invite Code:</p>
            <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{group.inviteCode}</p>
            <Button size="icon" variant="ghost" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLeaving}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLeaving ? 'Leaving...' : 'Leave Group'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
              <AlertDialogDescription>
                You will lose access to this group&apos;s location data. This action cannot be undone. {isOwner && 'As the owner, leaving this group will delete it for everyone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  setIsLeaving(true);
                  await onLeave(group.id);
                  setIsLeaving(false);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
