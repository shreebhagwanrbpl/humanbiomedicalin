import { adminDb } from "@/lib/firebase-admin";

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
    if (!adminDb) {
      return staticPages;
    }

    const snapshot = await adminDb
      .collection("websites")
      .doc("humanbiomedicalin")
      .collection("districts")
      .get();

    const districtPages = snapshot.docs.flatMap((doc) => {
      const slug = doc.id;

      return [
        {
          url: `${baseUrl}/${slug}`,
          lastModified: new Date(),
        },
        {
          url: `${baseUrl}/${slug}/about`,
          lastModified: new Date(),
        },
        {
          url: `${baseUrl}/${slug}/items`,
          lastModified: new Date(),
        },
        {
          url: `${baseUrl}/${slug}/contact`,
          lastModified: new Date(),
        },
      ];
    });

    return [...staticPages, ...districtPages];
  } catch (error) {
    console.error("Sitemap Error:", error);
    return staticPages;
  }
}