
'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let adminApp: App;

/**
 * Initializes and returns a singleton instance of the Firebase Admin SDK.
 * This is designed to be safe for serverless environments.
 */
function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // In a serverless environment (like Vercel or Netlify),
  // GOOGLE_APPLICATION_CREDENTIALS might be set up in the environment.
  // Otherwise, it falls back to using the project ID for basic initialization.
  adminApp = initializeApp({
    projectId: firebaseConfig.projectId,
  });

  return adminApp;
}

// Initialize and export the singleton instance.
adminApp = getAdminApp();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
