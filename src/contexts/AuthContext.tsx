'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

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

export type MockUser = {
  name: string;
  email: string;
  avatar: string; // first letter
  plan: string;
  usage: { rendered: number; total: number; takes: number; storage: string };
  library: LibraryItem[];
};

const MOCK_USERS: Record<string, MockUser> = {
  'demo@vocalcanvas.com': {
    name: 'Frank Chou',
    email: 'demo@vocalcanvas.com',
    avatar: 'F',
    plan: 'Pro',
    usage: { rendered: 360, total: 600, takes: 23, storage: '1.4 GB' },
    library: [
      { id: '1', title: '產品介紹 · 中文版', sub: '晨光 · 中文 · mp3', duration: '1:08', date: '2026-05-14', voice: '晨光 Dawn', lang: 'zh', favorite: true },
      { id: '2', title: 'Product Tour · EN', sub: 'Mist · English · mp3', duration: '2:14', date: '2026-05-12', voice: '夜霧 Mist', lang: 'en', favorite: false },
      { id: '3', title: '年度報告朗讀', sub: '焰心 · 中文 · mp3', duration: '4:32', date: '2026-05-10', voice: '焰心 Ember', lang: 'zh', favorite: true },
      { id: '4', title: 'Podcast Intro', sub: 'Glass · English · mp3', duration: '0:28', date: '2026-05-08', voice: '清玻 Glass', lang: 'en', favorite: false },
      { id: '5', title: '教學說明影片旁白', sub: '晨光 · 中文 · mp3', duration: '3:05', date: '2026-05-06', voice: '晨光 Dawn', lang: 'zh', favorite: false },
    ],
  },
  'empty@vocalcanvas.com': {
    name: 'New User',
    email: 'empty@vocalcanvas.com',
    avatar: 'N',
    plan: 'Free',
    usage: { rendered: 0, total: 600, takes: 0, storage: '0 GB' },
    library: [],
  },
};

const MOCK_PASSWORDS: Record<string, string> = {
  'demo@vocalcanvas.com': 'Demo1234',
  'empty@vocalcanvas.com': 'Demo1234',
};

type AuthCtx = {
  user: MockUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx>({ user: null, login: () => false, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('vc_user');
    if (saved) setUser(JSON.parse(saved) as MockUser);
  }, []);

  const login = (email: string, password: string): boolean => {
    const u = MOCK_USERS[email];
    if (u && MOCK_PASSWORDS[email] === password) {
      setUser(u);
      sessionStorage.setItem('vc_user', JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setUser(null);
    sessionStorage.removeItem('vc_user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtx {
  return useContext(AuthContext);
}
