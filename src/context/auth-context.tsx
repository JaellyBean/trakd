import type { User } from 'firebase/auth';
import type { TrakdUser } from '@/lib/types';

import { createContext } from 'react';

interface AuthContextType {
  user: User | null;
  trakdUser: TrakdUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
