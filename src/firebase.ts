import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  initializeFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  serverTimestamp, 
  Timestamp, 
  getDocFromServer,
  persistentLocalCache,
  persistentMultipleTabManager
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore to enable long polling which is more reliable in this environment
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    throw error;
  }
};

export { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile };

export const logout = () => signOut(auth);

// Firestore Error Handler
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
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const isPermissionError = error instanceof Error && 
    (error.message.includes('permission-denied') || error.message.includes('insufficient permissions'));
  
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }

  if (isPermissionError) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Non-Permission Error (likely connectivity):', errInfo.error);
    // Log the full error for debugging but don't throw to avoid crashing the UI
    console.debug('Full Firestore Error Info:', JSON.stringify(errInfo));
  }
}

// Connection Test
export async function testConnection() {
  const path = 'test/connection';
  try {
    // Attempt to get a doc from server to verify connection as per instructions
    console.log("Testing Firestore connection at:", path);
    await getDocFromServer(doc(db, path));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    if(error && error.message && error.message.includes('the client is offline')) {
      console.warn("Firestore appears to be in offline mode. This is often temporary in this environment.");
    } else {
      console.error("Firestore connectivity check failed.");
      // Provide more context if it's a permission error
      if (error && (error.code === 'permission-denied' || error.message?.includes('insufficient permissions'))) {
        console.error("DEBUG: Permission denied at path:", path);
        console.error("DEBUG: Current User UID:", auth.currentUser?.uid || "Not Authenticated");
        console.error("DEBUG: Database ID:", firebaseConfig.firestoreDatabaseId);
      }
      console.error("Full Error Details:", error);
    }
  }
}
// Call testConnection at module boot as required by system instructions
testConnection();
