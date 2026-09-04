import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const rawProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "garbagala";
const projectId = rawProjectId.trim();

const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCh2bNq1xlNyJgoa5rybEL49mGjJyNpVGc").trim(),
  authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "garbagala.firebaseapp.com").trim(),
  projectId,
  storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "garbagala.firebasestorage.app").trim(),
  messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "497124630114").trim(),
  appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:497124630114:web:6e93017e45196222b9bb3b").trim(),
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export default app;
