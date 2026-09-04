import * as admin from "firebase-admin";

if (!admin.apps.length) {
  const rawProjectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "garbagala";
  const projectId = rawProjectId.trim();
  
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (privateKey) {
    // If the key is wrapped in quotes, unwrap it
    if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
      privateKey = privateKey.slice(1, -1);
    }
    // Replace literal escaped newlines with actual newline characters
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: `${projectId}.firebasestorage.app`,
    });
  } else {
    // In production/serverless (e.g. Vercel), default ADC will fail.
    // Initialize with cert if available, or throw a clear initialization error in non-local environments.
    if (process.env.NODE_ENV === "production") {
      console.error("FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables are required on Vercel/serverless environments.");
    }
    admin.initializeApp({
      projectId,
    });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

