import { auth } from '@/lib/firebase';
import { getGroupsForUser, leaveGroup } from '@/app/actions';
import { GroupCard } from './group-card';
import { Users } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export async function GroupList() {
  const { currentUser } = auth;
  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <p>Please sign in to see your groups.</p>
      </div>
    );
  }

  const groups = await getGroupsForUser(currentUser.uid);

  if (groups.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating or joining a group.</p>
      </div>
    );
  }

  async function handleLeaveGroup(groupId: string) {
    "use server"
    if (!currentUser) return;
    await leaveGroup(groupId, currentUser.uid);
    revalidatePath('/groups');
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} userId={currentUser.uid} onLeave={handleLeaveGroup} />
      ))}
    </div>
  );
}
