// import admin from "firebase-admin";

// let adminDb = null;

// const projectId =   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
// const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
// const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
//   /\\n/g,
//   "\n"
// );

// if (
//   projectId &&
//   clientEmail &&
//   privateKey
// ) {
//   if (!admin.apps.length) {
//     admin.initializeApp({
//       credential: admin.credential.cert({
//         projectId,
//         clientEmail,
//         privateKey,
//       }),
//     });
//   }

//   adminDb = admin.firestore();
// }

// export { adminDb };




import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
console.log("projectId:", process.env.FIREBASE_PROJECT_ID);
console.log("clientEmail:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("privateKey:", !!process.env.FIREBASE_PRIVATE_KEY);
if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase Admin environment variables are missing.");
}

const app =
  getApps().length === 0
    ? initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
    : getApps()[0];
    

export const adminDb = getFirestore(app);