import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// Ensure environment variables are loaded even if Next.js hasn't injected them yet
let projectId = process.env.FIREBASE_PROJECT_ID;
let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("FIREBASE_PROJECT_ID=")) {
          projectId = trimmed.replace("FIREBASE_PROJECT_ID=", "").trim().replace(/^["']|["']$/g, "");
        } else if (trimmed.startsWith("FIREBASE_CLIENT_EMAIL=")) {
          clientEmail = trimmed.replace("FIREBASE_CLIENT_EMAIL=", "").trim().replace(/^["']|["']$/g, "");
        } else if (trimmed.startsWith("FIREBASE_PRIVATE_KEY=")) {
          let val = trimmed.replace("FIREBASE_PRIVATE_KEY=", "").trim();
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
          }
          privateKey = val.replace(/\\n/g, "\n");
        }
      }
    }
  } catch (e) {}
}

if (!projectId || !clientEmail || !privateKey) {
  // Hardcoded fallback for rajbiosis-central
  projectId = "rajbiosis-central";
  clientEmail = "firebase-adminsdk-fbsvc@rajbiosis-central.iam.gserviceaccount.com";
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