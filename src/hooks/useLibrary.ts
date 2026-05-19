'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LibraryItem {
  id: string;
  title: string;
  voice: string;
  duration: string;
  audioUrl: string;
  favorite: boolean;
  scenarioId: string;
  bgmTrack: string;
  createdAt: Date | null;
  date: string;
  sub: string;
}

export function useLibrary(uid: string | undefined) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'users', uid, 'library'),
      orderBy('createdAt', 'desc'),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => {
        const data = d.data();
        const createdAt = data.createdAt?.toDate() ?? null;
        return {
          id: d.id,
          title: data.title ?? 'Untitled',
          voice: data.voice ?? '',
          duration: data.duration ?? '0:00',
          audioUrl: data.audioUrl ?? '',
          favorite: data.favorite ?? false,
          scenarioId: data.scenarioId ?? 'custom',
          bgmTrack: data.bgmTrack ?? 'none',
          createdAt,
          date: createdAt ? createdAt.toLocaleDateString() : '',
          sub: `${data.voice ?? ''} · ${data.duration ?? ''}`,
        };
      });
      setItems(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const toggleFavorite = useCallback(
    async (itemId: string, current: boolean) => {
      if (!uid) return;
      await updateDoc(doc(db, 'users', uid, 'library', itemId), { favorite: !current });
    },
    [uid],
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!uid) return;
      await deleteDoc(doc(db, 'users', uid, 'library', itemId));
    },
    [uid],
  );

  const renameItem = useCallback(
    async (itemId: string, newTitle: string) => {
      if (!uid) return;
      await updateDoc(doc(db, 'users', uid, 'library', itemId), { title: newTitle });
    },
    [uid],
  );

  const addItem = useCallback(
    async (item: Omit<LibraryItem, 'id' | 'createdAt' | 'date' | 'sub'>) => {
      if (!uid) return;
      await addDoc(collection(db, 'users', uid, 'library'), {
        ...item,
        createdAt: serverTimestamp(),
      });
    },
    [uid],
  );

  return { items, loading, toggleFavorite, deleteItem, renameItem, addItem };
}
