import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { resolve } from 'path';

if (getApps().length === 0) {
  let credential;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const keyPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8')) as ServiceAccount;
    credential = cert(serviceAccount);
  }

  initializeApp({
    credential,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();
