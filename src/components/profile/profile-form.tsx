import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { updateUserProfile } from '@/app/actions';
import { ProfileFormClient } from './profile-form-client';

async function getUserProfile(uid: string) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL || '',
    };
  }
  return { displayName: '', email: '', photoURL: '' };
}

export async function ProfileForm() {
  const { currentUser } = auth;

  if (!currentUser) {
    return <p>You must be signed in to view your profile.</p>;
  }

  const profile = await getUserProfile(currentUser.uid);

  return <ProfileFormClient profile={profile} />;
}
