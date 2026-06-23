import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = "https://humanbiomedical.in";

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/items",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  try {
    // DEBUG
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw new Error("❌ FIREBASE_PROJECT_ID missing");
    }

    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error("❌ FIREBASE_CLIENT_EMAIL missing");
    }

    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error("❌ FIREBASE_PRIVATE_KEY missing");
    }

    if (!adminDb) {
      throw new Error("❌ adminDb NULL");
    }

    const snapshot = await adminDb
      .collection("websites")
      .doc("humanbiomedicalin")
      .collection("districts")
      .get();

    const districtPages = snapshot.docs.flatMap((doc) => {
      const slug = doc.id;

      return [
        { url: `${baseUrl}/${slug}` },
        { url: `${baseUrl}/${slug}/about` },
        { url: `${baseUrl}/${slug}/items` },
        { url: `${baseUrl}/${slug}/contact` },
      ];
    });

    return [...staticPages, ...districtPages];
  } catch (error) {
    console.error("SITEMAP ERROR:", error);

    // TEMPORARY: error browser me dikhega
    return [
      ...staticPages,
      {
        url: `${baseUrl}/debug-${encodeURIComponent(
          error.message
        )}`,
        lastModified: new Date(),
      },
    ];
  }
}