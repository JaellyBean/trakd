'use server';

import { revalidatePath } from 'next/cache';
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
  arrayUnion,
  arrayRemove,
  updateDoc,
  runTransaction,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Group } from '@/lib/types';
import { updateProfile } from 'firebase/auth';

// Helper to generate a unique invite code
async function generateInviteCode(length = 6): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const q = query(collection(db, 'groups'), where('inviteCode', '==', result));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return generateInviteCode(length); // Regenerate if code already exists
  }
  return result;
}

export async function createGroup(name: string, ownerId: string) {
  try {
    const inviteCode = await generateInviteCode();
    const groupRef = doc(collection(db, 'groups'));
    const userRef = doc(db, 'users', ownerId);

    const batch = writeBatch(db);

    batch.set(groupRef, {
      name,
      ownerId,
      members: [ownerId],
      inviteCode,
    });

    batch.update(userRef, {
      groups: arrayUnion(groupRef.id),
    });

    await batch.commit();
    revalidatePath('/groups');
    return { success: true, groupId: groupRef.id };
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error: 'Failed to create group.' };
  }
}

export async function joinGroup(inviteCode: string, userId: string) {
    try {
      const q = query(collection(db, 'groups'), where('inviteCode', '==', inviteCode.toUpperCase()));
      const snapshot = await getDocs(q);
  
      if (snapshot.empty) {
        return { success: false, error: 'Invalid invite code.' };
      }
  
      const groupDoc = snapshot.docs[0];
      const group = groupDoc.data() as Group;
  
      if (group.members.includes(userId)) {
        return { success: false, error: 'You are already in this group.' };
      }
  
      const groupRef = doc(db, 'groups', groupDoc.id);
      const userRef = doc(db, 'users', userId);
  
      const batch = writeBatch(db);
      batch.update(groupRef, { members: arrayUnion(userId) });
      batch.update(userRef, { groups: arrayUnion(groupDoc.id) });
  
      await batch.commit();
      revalidatePath('/groups');
      return { success: true };
    } catch (error) {
      console.error('Error joining group:', error);
      return { success: false, error: 'Failed to join group.' };
    }
}

export async function leaveGroup(groupId: string, userId: string) {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const userRef = doc(db, 'users', userId);
  
      await runTransaction(db, async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        if (!groupDoc.exists()) {
          throw 'Group not found.';
        }
  
        const groupData = groupDoc.data() as Group;
  
        // If owner leaves, delete the group for everyone
        if (groupData.ownerId === userId) {
            // Remove group from all members' user docs
            for (const memberId of groupData.members) {
                const memberRef = doc(db, 'users', memberId);
                transaction.update(memberRef, { groups: arrayRemove(groupId) });
            }
            // Delete the group document
            transaction.delete(groupRef);
        } else {
            // Just remove the member from the group
            transaction.update(groupRef, { members: arrayRemove(userId) });
            transaction.update(userRef, { groups: arrayRemove(groupId) });
        }
      });
  
      revalidatePath('/groups');
      return { success: true };
    } catch (error) {
      console.error('Error leaving group:', error);
      return { success: false, error: 'Failed to leave group.' };
    }
}

export async function getGroupsForUser(userId: string): Promise<Group[]> {
    const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
}

type UserProfileData = {
    displayName: string;
    photoURL: string;
};

export async function updateUserProfile(uid: string, data: UserProfileData) {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
        return { success: false, error: 'Not authenticated.' };
    }

    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            displayName: data.displayName,
            photoURL: data.photoURL,
        });

        await updateProfile(auth.currentUser, {
            displayName: data.displayName,
            photoURL: data.photoURL,
        });

        revalidatePath('/profile');
        revalidatePath('/map');
        revalidatePath('/groups');
        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Failed to update profile.' };
    }
}
