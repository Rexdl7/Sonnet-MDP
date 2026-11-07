import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, 
  getRedirectResult, signOut 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
// Safely load firebase-applet-config.json if present (eager glob avoids Vite pre-transform error when file is deleted)
let configFromJson: Record<string, any> = {};
try {
  const configs = import.meta.glob('/firebase-applet-config.json', { eager: true });
  const keys = Object.keys(configs);
  if (keys.length > 0) {
    const mod = configs[keys[0]] as any;
    configFromJson = mod?.default || mod || {};
  }
} catch {
  // Safe fallback when file is absent
}

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: configFromJson.apiKey || env.VITE_FIREBASE_API_KEY || '',
  authDomain: configFromJson.authDomain || env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: configFromJson.projectId || env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: configFromJson.storageBucket || env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: configFromJson.messagingSenderId || env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: configFromJson.appId || env.VITE_FIREBASE_APP_ID || '',
  measurementId: configFromJson.measurementId || env.VITE_FIREBASE_MEASUREMENT_ID || '',
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || '',
};

// Initialize or retrieve Firebase app instance dynamically
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

// Configure Google OAuth provider with YouTube Readonly access
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'consent select_account',
});

// In-memory access token cache for Google Workspace & YouTube Data API calls
let cachedAccessToken: string | null = null;

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((p) => ({
        providerId: p.providerId,
        email: p.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    if (!firebaseConfig.apiKey) {
      return false;
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    return false;
  }
}

export { signInWithPopup, signInWithRedirect, getRedirectResult, signOut };
