'use client';

import { AuthContext } from '@/context/auth-context';
import { auth, db } from '@/lib/firebase';
import type { TrakdUser } from '@/lib/types';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const AUTH_ROUTES = ['/sign-in', '/sign-up'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [trakdUser, setTrakdUser] = useState<TrakdUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setTrakdUser(doc.data() as TrakdUser);
        } else {
          setTrakdUser(null);
        }
      });
      return () => unsub();
    } else {
      setTrakdUser(null);
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = AUTH_ROUTES.includes(pathname);

    if (!user && !isAuthRoute) {
      router.push('/sign-in');
    } else if (user && isAuthRoute) {
      router.push('/map');
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, trakdUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
