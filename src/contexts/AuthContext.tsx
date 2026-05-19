'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Kept for backward compat -- Phase 2 will use Firestore subcollection. */
export type LibraryItem = {
  id: string;
  title: string;
  sub: string;
  duration: string;
  date: string;
  voice: string;
  lang: string;
  favorite: boolean;
};

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar: string;           // First char of name
  avatarUrl: string | null;
  plan: string;             // 'Free' | 'Pro'
  emailVerified: boolean;
  usage: {
    rendered: number;       // minutes (converted from seconds in Firestore)
    total: number;          // minutes
    takes: number;
    storage: string;
  };
  library: never[];         // Empty array for backward compat
}

export interface AuthContextValue {
  user: AppUser | null;
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setStaySignedIn: (stay: boolean) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Default Firestore document for a brand-new user. */
function defaultUserDoc(firebaseUser: FirebaseUser) {
  return {
    name: firebaseUser.displayName || 'User',
    email: firebaseUser.email,
    avatarUrl: firebaseUser.photoURL || null,
    plan: 'free',
    createdAt: serverTimestamp(),
    preferences: {
      lang: 'zh',
      readingLang: 'zh-TW',
      outputFormat: 'mp3-240',
      autoSave: true,
      emailNotif: true,
      productNews: false,
    },
    usage: {
      rendered: 0,
      total: 1800,
      takes: 0,
      storage: '0 GB',
      resetAt: null,
    },
  };
}

/** Build an AppUser from a FirebaseUser + Firestore document data. */
function buildAppUser(
  firebaseUser: FirebaseUser,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
): AppUser {
  const name: string = (data.name as string) || firebaseUser.displayName || 'User';
  const planRaw: string = (data.plan as string) || 'free';

  const usage = data.usage ?? { rendered: 0, total: 1800, takes: 0, storage: '0 GB' };

  return {
    id: firebaseUser.uid,
    name,
    email: firebaseUser.email ?? '',
    avatar: name.charAt(0).toUpperCase(),
    avatarUrl: (data.avatarUrl as string | null) ?? firebaseUser.photoURL ?? null,
    plan: planRaw.charAt(0).toUpperCase() + planRaw.slice(1), // 'free' -> 'Free'
    emailVerified: firebaseUser.emailVerified,
    usage: {
      rendered: Math.round((usage.rendered ?? 0) / 60),
      total: Math.round((usage.total ?? 1800) / 60),
      takes: usage.takes ?? 0,
      storage: usage.storage ?? '0 GB',
    },
    library: [] as never[],
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authState: 'loading',
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  setStaySignedIn: async () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');

  // ----- onAuthStateChanged listener -----
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        setAuthState('unauthenticated');
        return;
      }

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);

        let data: Record<string, unknown>;
        if (snap.exists()) {
          data = snap.data() as Record<string, unknown>;
        } else {
          // First login (e.g. Google sign-in) -- create Firestore doc with defaults
          const defaults = defaultUserDoc(firebaseUser);
          await setDoc(userRef, defaults);
          data = { ...defaults, createdAt: new Date() }; // local fallback for serverTimestamp
        }

        setUser(buildAppUser(firebaseUser, data));
        setAuthState('authenticated');
      } catch (err) {
        console.error('[AuthContext] Failed to load user profile:', err);
        // Even if Firestore read fails, the user *is* authenticated with Firebase Auth.
        // Build a minimal AppUser from the FirebaseUser object.
        setUser(buildAppUser(firebaseUser, {}));
        setAuthState('authenticated');
      }
    });

    return unsubscribe;
  }, []);

  // ----- Auth methods -----

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle setting user state
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = credential.user;

    // Set displayName on Firebase Auth profile
    await updateProfile(firebaseUser, { displayName: name });

    // Send email verification
    await sendEmailVerification(firebaseUser);

    // Create Firestore user document
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      ...defaultUserDoc(firebaseUser),
      name, // Use the provided name (updateProfile may not have propagated yet)
    });
    // onAuthStateChanged will fire and build the AppUser
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle Firestore doc creation if needed
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await signOut(auth);
    // onAuthStateChanged will set user to null
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const setStaySignedIn = useCallback(async (stay: boolean): Promise<void> => {
    await setPersistence(auth, stay ? browserLocalPersistence : browserSessionPersistence);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, authState, login, signup, loginWithGoogle, logout, resetPassword, setStaySignedIn }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
