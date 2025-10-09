import { GroupList } from '@/components/groups/group-list';
import { JoinGroupForm } from '@/components/groups/join-group-form';
import { CreateGroupForm } from '@/components/groups/create-group-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Groups | Trak\'d',
};

function GroupListSkeleton() {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-4 flex justify-between items-center">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </Card>
        ))}
      </div>
    );
  }

export default function GroupsPage() {
  return (
    <div className="h-full p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-headline font-semibold">Groups</h1>
          <p className="text-muted-foreground">
            Manage your location sharing groups.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Group</DialogTitle>
            </DialogHeader>
            <CreateGroupForm />
          </DialogContent>
        </Dialog>
      </header>
      
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Your Groups</CardTitle>
                    <CardDescription>Groups you are currently a member of.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<GroupListSkeleton />}>
                        <GroupList />
                    </Suspense>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Join a Group</CardTitle>
              <CardDescription>
                Enter an invite code to join an existing group.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JoinGroupForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
