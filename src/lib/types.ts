import type { Timestamp } from 'firebase/firestore';

export type TrakdUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  groups: string[]; // array of group IDs
  lastSeen: Timestamp;
  location: {
    latitude: number;
    longitude: number;
    timestamp: Timestamp;
  } | null;
  battery: {
    level: number;
    charging: boolean;
  } | null;
};

export type Group = {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // array of user UIDs
  inviteCode: string;
};
